const express = require('express');
const router = express.Router();
const pool = require('../db');

// Salvar treino
router.post('/', async (req, res) => {
  let body = Array.isArray(req.body) ? req.body[0] : req.body;
  let treinoRaw = body.Treino || body.treino;

  if (!treinoRaw || typeof treinoRaw !== 'string') {
    return res.status(400).json({ error: 'Campo Treino inválido ou ausente.' });
  }

  const id_user = body.id_user || body.ID_User;
  const id_formulario = body.id_formulario || body.ID_Formulario;

  if (!id_user || !id_formulario) {
    return res.status(400).json({ error: 'id_user ou id_formulario inválidos ou ausentes.' });
  }

  try {
    const cleaned = treinoRaw.replace(/```json/, '').replace(/```/, '').trim();
    const treino = JSON.parse(cleaned);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const diaTreino of treino) {
        const insertTreinoText = `
          INSERT INTO treino (id_formulario, dia, grupo_muscular)
          VALUES ($1, $2, $3) RETURNING id
        `;
        const resTreino = await client.query(insertTreinoText, [
          id_formulario,
          diaTreino.dia,
          diaTreino.grupoMuscular,
        ]);

        const id_treino = resTreino.rows[0].id;

        for (const ex of diaTreino.exercicios) {
          await client.query(
            `INSERT INTO exercicio (id_treino, nome, series, repeticoes)
             VALUES ($1, $2, $3, $4)`,
            [id_treino, ex.nome, ex.series, ex.repeticoes.toString()]
          );
        }
      }

      await client.query('COMMIT');
      client.release();

      return res.json({
        message: 'Treino salvo no banco com sucesso',
        id_user,
        id_formulario,
        treino,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      console.error('Erro na transação:', error);
      return res.status(500).json({ error: 'Erro ao salvar treino no banco.' });
    }
  } catch (e) {
    console.error('Erro ao fazer parse do treino:', e);
    return res.status(400).json({ error: 'Formato JSON inválido no campo Treino.' });
  }
});

// Buscar treino
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const treinoQuery = `
      SELECT * FROM treino WHERE id_formulario = $1;
    `;
    const treinoResult = await pool.query(treinoQuery, [id]);

    if (treinoResult.rows.length === 0) {
      return res.status(404).json({ message: "Treino não encontrado." });
    }

    const treinos = await Promise.all(
      treinoResult.rows.map(async (treino) => {
        const exercicioQuery = `
          SELECT nome, series, repeticoes FROM exercicio WHERE id_treino = $1;
        `;
        const exercicioResult = await pool.query(exercicioQuery, [treino.id]);
        return {
          ...treino,
          exercicios: exercicioResult.rows,
        };
      })
    );

    res.json(treinos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar treino" });
  }
});

// Desativar treino
router.put('/deletar-completo/:id_formulario', async (req, res) => {
  const { id_formulario } = req.params;

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Atualiza status do formulário para false
      const updateFormularioText = `
        UPDATE formulario_treino
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
      client.release();

      return res.json({
        message: 'Formulário e treinos desativados com sucesso.',
        formulario: resFormulario.rows[0],
      });
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      console.error('Erro na transação:', error);
      return res.status(500).json({ error: 'Erro ao desativar formulário e treinos.' });
    }
  } catch (error) {
    console.error('Erro ao conectar no banco:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

module.exports = router;
