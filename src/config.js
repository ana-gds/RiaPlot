// Configuração central da aplicação.
//
// A URL base da API vem da variável de ambiente VITE_API_URL (definida em
// `.env`). Em desenvolvimento, se não estiver definida, recai no servidor
// Laravel local. Assim o deploy não exige editar código — basta definir a
// variável no ambiente.
export const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";
