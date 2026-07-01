// 🛡️ Helper para gerenciar usuário no localStorage de forma segura

/**
 * Obtém os dados do usuário do localStorage de forma segura
 * @returns {Object} Dados do usuário ou objeto vazio
 */
export function getUsuario() {
  try {
    const userData = localStorage.getItem("usuario");
    return userData ? JSON.parse(userData) : {};
  } catch (error) {
    return {};
  }
}

/**
 * Salva os dados do usuário no localStorage
 * @param {Object} usuario - Dados do usuário
 */
export function setUsuario(usuario) {
  try {
    localStorage.setItem("usuario", JSON.stringify(usuario));
  } catch (error) {
  }
}

/**
 * Remove os dados do usuário do localStorage
 */
export function removeUsuario() {
  try {
    localStorage.removeItem("usuario");
  } catch (error) {
  }
}

/**
 * Verifica se o usuário está logado
 * @returns {boolean}
 */
export function isUsuarioLogado() {
  const usuario = getUsuario();
  return usuario && usuario.id;
}