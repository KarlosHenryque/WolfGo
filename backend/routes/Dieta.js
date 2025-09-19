const express = require('express');
const router = express.Router();
const pool = require('../db');

function extrairQuantidadeEAlimento(texto) {
  const match = texto.match(/^([\d\/.,\s\w()]+)\s+de\s+(.+)$/i); 
  if (match) {
    return {
      quantidade: match[1].trim(),
      alimento: match[2].trim()
    };
  } else {
    return {
      quantidade: null,
      alimento: texto.trim()
    };
  }
}

// Inserção no banco de dados
router.post('/', async (req, res) => {
    const { id_usuario, id_formulario_treino, id_formulario_dieta, dieta: dietaRaw } = req.body;

    if (!id_usuario || !id_formulario_treino || !id_formulario_dieta) {
      return res.status(400).json({ error: 'id_usuario, id_formulario_treino e id_formulario_dieta são obrigatórios.' });
    }

    if (!dietaRaw || typeof dietaRaw !== 'string') {
      return res.status(400).json({ error: 'Campo dieta inválido ou ausente.' });
    }

    const client = await pool.connect();

    try {
      const cleaned = dietaRaw.replace(/```(?:json)?/gi, '').trim();
      const dieta = JSON.parse(cleaned);

      if (!Array.isArray(dieta)) {
        return res.status(400).json({ error: 'Formato da dieta inválido. Deve ser um array.' });
      }

      await client.query('BEGIN');

      for (const diaObj of dieta) {
        const { dia, refeicoes } = diaObj;

        const diaResult = await client.query(
          'INSERT INTO dieta_dia (id_formulario_dieta, dia) VALUES ($1, $2) RETURNING id',
          [id_formulario_dieta, dia]
        );
        const diaId = diaResult.rows[0].id;

        for (const refeicaoObj of refeicoes) {
          const { refeicao, itens } = refeicaoObj;

          const refeicaoResult = await client.query(
            'INSERT INTO dieta_refeicao (id_dia, refeicao) VALUES ($1, $2) RETURNING id',
            [diaId, refeicao]
          );
          const refeicaoId = refeicaoResult.rows[0].id;

          for (const item of itens) {
            let nomeAlimento = null;
            let quantidade = null;

            if (typeof item === 'string') {
              const extraido = extrairQuantidadeEAlimento(item);
              nomeAlimento = extraido.alimento;
              quantidade = extraido.quantidade;
            }

            if (typeof item === 'object' && item.nome) {
              nomeAlimento = item.nome;
              quantidade = item.quantidade || 'Não informado';
            }

            await client.query(
              'INSERT INTO dieta_alimento (id_refeicao, alimentos, quantidade) VALUES ($1, $2, $3)',
              [refeicaoId, nomeAlimento, quantidade]
            );
          }
        }
      }

      await client.query('COMMIT');

      return res.status(201).json({
        message: 'Dieta salva com sucesso!',
        id_usuario,
        id_formulario_treino,
        id_formulario_dieta
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao salvar dieta:', error);
      return res.status(500).json({
        error: 'Erro ao salvar dieta.',
        details: error.message
      });
    } finally {
      client.release();
    }
});

//Localizar dieta por usuario
router.get('/usuario/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        fd.id AS id_formulario_dieta,
        fd.nome_dieta,
        fd.data_criacao,
        fd.objetivo,
        fd.status,
        ft.nome_treino
      FROM formulario_dieta fd
      LEFT JOIN formulario_treino ft ON fd.id_formulario_treino = ft.id
      WHERE fd.id_usuario = $1
      ORDER BY fd.data_criacao DESC
    `, [id_usuario]);

    res.status(200).json({ dietas: result.rows });
  } catch (error) {
    console.error('Erro ao buscar dietas do usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar dietas' });
  }
});

// Dieta detalhada 
router.get('/detalhada/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const dietaRes = await pool.query(`
      SELECT nome_dieta AS nome, status AS ativo 
      FROM formulario_dieta
      WHERE id = $1
    `, [id]);

    const diasRes = await pool.query(`
      SELECT dd.id AS dia_id, dd.dia
      FROM dieta_dia dd
      WHERE dd.id_formulario_dieta = $1
      ORDER BY dd.id
    `, [id]);

    const dias = [];

    for (const dia of diasRes.rows) {
      const refeicoesRes = await pool.query(`
        SELECT dr.id AS refeicao_id, dr.refeicao
        FROM dieta_refeicao dr
        WHERE dr.id_dia = $1
        ORDER BY dr.id
      `, [dia.dia_id]);

      const refeicoes = [];

      for (const refeicao of refeicoesRes.rows) {
        const alimentosRes = await pool.query(`
          SELECT alimentos, quantidade
          FROM dieta_alimento
          WHERE id_refeicao = $1
          ORDER BY id
        `, [refeicao.refeicao_id]);

        const itens = alimentosRes.rows.map(item => {
          if (item.quantidade) {
            return `${item.quantidade} de ${item.alimentos}`;
          } else {
            return item.alimentos;
          }
        });

        refeicoes.push({
          refeicao: refeicao.refeicao,
          itens
        });
      }

      dias.push({
        dia: dia.dia,
        refeicoes
      });
    }

    return res.status(200).json({
      dieta: dietaRes.rows[0] || {},
      dias
    });

  } catch (error) {
    console.error("Erro ao buscar dieta detalhada:", error);
    return res.status(500).json({ message: "Erro ao buscar dieta detalhada" });
  }
});

// Desativar treino (marca status = false)
router.put('/deletar/:id_formulario', async (req, res) => {
  const { id_formulario } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updateFormularioText = `
      UPDATE formulario_dieta
      SET status = false
      WHERE id = $1
      RETURNING *;
    `;
    const resFormulario = await client.query(updateFormularioText, [id_formulario]);

    if (resFormulario.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Formulário não encontrado.' });
    }

    await client.query('COMMIT');

    return res.json({
      message: 'Formulário e treinos desativados com sucesso.',
      formulario: resFormulario.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro na transação:', error);
    return res.status(500).json({ error: 'Erro ao desativar formulário e treinos.' });
  } finally {
    client.release();
  }
});

// Ativar treino (marca status = true)
router.put('/ativar/:id_formulario', async (req, res) => {
  const { id_formulario } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updateFormularioText = `
      UPDATE formulario_dieta
      SET status = true
      WHERE id = $1
      RETURNING *;
    `;
    const resFormulario = await client.query(updateFormularioText, [id_formulario]);

    if (resFormulario.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Formulário não encontrado.' });
    }

    await client.query('COMMIT');

    return res.json({
      message: 'Formulário ativado com sucesso.',
      formulario: resFormulario.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro na transação:', error);
    return res.status(500).json({ error: 'Erro ao ativar formulário.' });
  } finally {
    client.release();
  }
});


module.exports = router;
