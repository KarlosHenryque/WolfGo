import Swal from 'sweetalert2';
import '../components/assets/css/PerfilUsuario.css';

const imagemPadrao = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

export async function PerfilUsuario({ id }) {
  if (!id) {
    return Swal.fire('Erro', 'ID do usuário não fornecido', 'error');
  }

  try {
    const response = await fetch(`http://localhost:5000/api/perfil/${id}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar dados do usuário');
    }
    const usuario = await response.json();

    Swal.fire({
      title: 'Perfil',
      html: `
        <div class="perfil-container">
          <img id="fotoPerfilPreview" src="${usuario.foto ? 'data:image/jpeg;base64,' + usuario.foto : imagemPadrao}" alt="Foto de Perfil" />
          <label for="inputFotoPerfil" class="btn-upload">Escolher foto</label>
          <input type="file" id="inputFotoPerfil" accept="image/*" />
          
          <div class="perfil-info">
              <p><strong>Nome:</strong> ${usuario.nome}</p>
              <p><strong>Email:</strong> ${usuario.email}</p>
          </div>
        </div>
      `,
      confirmButtonText: 'Salvar',
      showCancelButton: true,
      reverseButtons: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      width: '450px',
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
      },
      preConfirm: () => {
        const file = document.getElementById('inputFotoPerfil').files[0];
        if (file) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64String = reader.result.split(',')[1];
              resolve({ novaFoto: base64String });
            };
            reader.readAsDataURL(file);
          });
        }
        return { novaFoto: null };
      }
    }).then(async result => {
      if (result.isConfirmed && result.value?.novaFoto) {
        const novaFotoBase64 = result.value.novaFoto;

        try {
          const resUpdate = await fetch(`http://localhost:5000/api/perfil/foto/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fotoBase64: novaFotoBase64 }) 
          });

          if (!resUpdate.ok) {
            throw new Error('Erro ao atualizar foto');
          }

          const data = await resUpdate.json();
          Swal.fire('Sucesso', data.mensagem, 'success');
        } catch (error) {
          Swal.fire('Erro', 'Não foi possível atualizar a foto.', 'error');
        }
      }
    });

  } catch (error) {
    Swal.fire('Erro', error.message || 'Erro ao carregar perfil', 'error');
  }
}
