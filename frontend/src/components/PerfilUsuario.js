import Swal from 'sweetalert2';
import '../components/assets/css/PerfilUsuario.css';

const imagemPadrao = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

export async function ConfigPerfilUsuario(id) {
  if (!id) {
    return Swal.fire('Erro', 'ID do usuário não fornecido', 'error');
  }

  try {
    const response = await fetch(`http://localhost:5000/api/perfil/${id}`);
    if (!response.ok) throw new Error('Erro ao buscar dados do usuário');

    const usuario = await response.json();

    Swal.fire({
      title: 'Editar Perfil',
      html: `
        <div class="config-perfil-container">
          <img id="fotoPerfilPreview" src="${usuario.foto ? 'data:image/jpeg;base64,' + usuario.foto : imagemPadrao}" alt="Foto de Perfil" />
          <label for="inputFotoPerfil" class="config-btn-upload">Escolher foto</label>
          <input type="file" id="inputFotoPerfil" accept="image/*" />

          <div class="perfil-info">
            <input id="inputNome" class="config-input" placeholder="Nome" value="${usuario.nome}" />
            <input id="inputEmail" class="config-input" placeholder="Email" value="${usuario.email}" />
            <button id="btnAlterarSenha" class="config-btn-alterar-senha">Alterar senha</button>
          </div>
        </div>
      `,
      confirmButtonText: 'Salvar',
      showCancelButton: true,
      reverseButtons: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      width: '500px',
      padding: '1.5em',
      didOpen: () => {
        const inputFoto = document.getElementById('inputFotoPerfil');
        const previewImg = document.getElementById('fotoPerfilPreview');

        inputFoto.addEventListener('change', (event) => {
          const file = event.target.files[0];
          if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
              previewImg.src = reader.result;
            };
            reader.readAsDataURL(file);
          }
        });

        const btnSenha = document.getElementById('btnAlterarSenha');
        btnSenha.addEventListener('click', () => {
          Swal.fire({
            title: 'Alterar Senha',
            html: `
              <div class="config-perfil-container">
                <input id="senhaAtual" type="password" class="config-input" placeholder="Senha atual" />
                <input id="novaSenha" type="password" class="config-input" placeholder="Nova senha" />
                <input id="confirmarSenha" type="password" class="config-input" placeholder="Confirmar nova senha" />
              </div>
            `,
            confirmButtonText: 'Salvar',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#dc3545',
            width: 500,
            showCancelButton: true,
            reverseButtons: true,
            preConfirm: () => {
              const atual = document.getElementById('senhaAtual').value;
              const nova = document.getElementById('novaSenha').value;
              const confirmar = document.getElementById('confirmarSenha').value;

              if (!atual || !nova || !confirmar) {
                Swal.showValidationMessage('Preencha todos os campos');
              } else if (nova !== confirmar) {
                Swal.showValidationMessage('As senhas não coincidem');
              }

              return { atual, nova };
            }
          }).then(async result => {
            if (result.isConfirmed) {
              try {
                const resSenha = await fetch(`http://localhost:5000/api/perfil/senha/${id}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    senhaAtual: result.value.atual,
                    novaSenha: result.value.nova
                  })
                });

                if (!resSenha.ok) throw new Error('Erro ao atualizar senha');
                const data = await resSenha.json();

                Swal.fire('Sucesso', data.mensagem || 'Senha atualizada!', 'success');
              } catch (error) {
                Swal.fire('Erro', error.message || 'Falha ao atualizar senha.', 'error');
              }
            }
          });
        });
      },
      preConfirm: () => {
        const file = document.getElementById('inputFotoPerfil').files[0];
        const nome = document.getElementById('inputNome').value;
        const email = document.getElementById('inputEmail').value;

        if (!nome || !email) {
          Swal.showValidationMessage('Nome e Email são obrigatórios');
          return false;
        }

        return new Promise((resolve) => {
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              const base64Foto = reader.result.split(',')[1];
              resolve({ nome, email, novaFoto: base64Foto });
            };
            reader.readAsDataURL(file);
          } else {
            resolve({ nome, email, novaFoto: null });
          }
        });
      }
    }).then(async result => {
      if (result.isConfirmed) {
        const { nome, email, novaFoto } = result.value;

        try {
          const res = await fetch(`http://localhost:5000/api/perfil/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email })
          });

          if (!res.ok) throw new Error('Erro ao atualizar perfil');

          if (novaFoto) {
            await fetch(`http://localhost:5000/api/perfil/foto/${id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fotoBase64: novaFoto })
            });
          }

          Swal.fire('Sucesso', 'Perfil atualizado com sucesso!', 'success');
        } catch (error) {
          Swal.fire('Erro', error.message || 'Erro ao atualizar perfil.', 'error');
        }
      }
    });

  } catch (error) {
    Swal.fire('Erro', error.message || 'Erro ao carregar perfil.', 'error');
  }
}
