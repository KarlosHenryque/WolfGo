const express = require('express');
const router = express.Router();
const pool = require('../db'); 

router.post('/', async (req, res) => {
  console.log(req.body); 
  const { id_usuario, id_formulario_usuario, id_formulario_dieta, dieta: dietaRaw } = req.body;

  if (!id_usuario || !id_formulario_usuario || !id_formulario_dieta) {
    return res.status(400).json({ error: 'id_usuario, id_formulario_usuario e id_formulario_dieta são obrigatórios.' });
  }

  if (!dietaRaw || typeof dietaRaw !== 'string') {
    return res.status(400).json({ error: 'Campo dieta inválido ou ausente.' });
  }

  try {
    const cleaned = dietaRaw.replace(/```json/g, '').replace(/```/g, '').trim();
    const dieta = JSON.parse(cleaned);

    if (!Array.isArray(dieta)) {
      return res.status(400).json({ error: 'Formato da dieta inválido. Deve ser um array.' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const insertDietaText = `
        INSERT INTO dieta (id_formulario_usuario, id_usuario, id_formulario_dieta)
        VALUES ($1, $2, $3)
        RETURNING id
      `;
      const resDieta = await client.query(insertDietaText, [id_formulario_usuario, id_usuario, id_formulario_dieta]);
      const idDieta = resDieta.rows[0].id;

      for (const diaObj of dieta) {
        const { dia, refeicoes } = diaObj;

        const insertDiaText = `
          INSERT INTO dieta_dia (id_dieta, dia)
          VALUES ($1, $2)
          RETURNING id
        `;
        const resDia = await client.query(insertDiaText, [idDieta, dia]);
        const idDia = resDia.rows[0].id;

        for (const refeicaoObj of refeicoes) {
          const { refeicao, itens } = refeicaoObj;

          const insertRefeicaoText = `
            INSERT INTO dieta_refeicao (id_dia, refeicao)
            VALUES ($1, $2)
            RETURNING id
          `;
          const resRefeicao = await client.query(insertRefeicaoText, [idDia, refeicao]);
          const idRefeicao = resRefeicao.rows[0].id;

          for (const item of itens) {
            const insertItemText = `
              INSERT INTO dieta_item (id_refeicao, item)
              VALUES ($1, $2)
            `;
            await client.query(insertItemText, [idRefeicao, item]);
          }
        }
      }

      await client.query('COMMIT');
      res.json({ message: 'Dieta salva com sucesso', idDieta });

    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Erro ao salvar dieta:', err);
      res.status(500).json({ error: 'Erro ao salvar dieta no banco.', details: err.message });
    } finally {
      client.release();
    }

  } catch (error) {
    return res.status(400).json({ error: 'Formato JSON inválido no campo dieta.', details: error.message });
  }
});

router.get('/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const result = await pool.query('SELECT * FROM dieta WHERE id_usuario = $1', [id_usuario]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar dietas' });
  }
});


router.get('/detalhada/:id_dieta', async (req, res) => {
  const { id_dieta } = req.params;

  try {
    const client = await pool.connect();

    const dietaQuery = await client.query(
      'SELECT * FROM dieta WHERE id = $1',
      [id_dieta]
    );
    const dieta = dietaQuery.rows[0];

    const diasQuery = await client.query(
      'SELECT * FROM dieta_dia WHERE id_dieta = $1',
      [id_dieta]
    );
    const dias = diasQuery.rows;

    for (const dia of dias) {
      const refeicoesQuery = await client.query(
        'SELECT * FROM dieta_refeicao WHERE id_dia = $1',
        [dia.id]
      );
      const refeicoes = refeicoesQuery.rows;

      for (const refeicao of refeicoes) {
        const itensQuery = await client.query(
          'SELECT * FROM dieta_item WHERE id_refeicao = $1',
          [refeicao.id]
        );
        refeicao.itens = itensQuery.rows.map((i) => i.item);
      }

      dia.refeicoes = refeicoes;
    }

    client.release();

    res.json({
      dieta,
      dias,
    });
  } catch (error) {
    console.error('Erro ao buscar dieta detalhada:', error);
    res.status(500).json({ error: 'Erro ao buscar dieta detalhada' });
  }
});


module.exports = router;
