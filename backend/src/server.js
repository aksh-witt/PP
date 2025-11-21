const mysql = require ('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'magic',
    database: 'pp'
});

connection.connect((err) =>{
    if(err) {
        throw err;
    }   else {
        console.log('vai corinthians')
    }
});

module.exports = connection;

//

const express = require("express");
const cors = require("cors");
const axios = require('axios');

const port = 3005;

const app = express();

app.use(cors());
app.use(express.json());

//
const multer = require('multer');
const path = require('path');
const fs = require('fs');

app.listen(port, () => console.log(`sala: ${port}`));

// Config Multer

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // CORRIGIDO: Usar path.join com __dirname para garantir o caminho correto
        const uploadDir = path.join(__dirname, '../uploads/');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        console.log('Salvando arquivo em:', uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        console.log('Nome do arquivo:', uniqueName);
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});


// Cadastro

app.post('/usuario/cadastrar', async (request, response) => {
    const { name, email, pass } = request.body; 

    // Query para inserir os dados
    let query = "INSERT INTO users(name, email, password) VALUES (?, ?, ?)";

    // Executar a query no banco de dados
    connection.query(query, [name, email, pass], (err, results) => {
        if (err) {
            return response.status(400).json({
                success: false,
                message: "Erro ao cadastrar usuário",
                error: err
            });
        }
        response.status(201).json({
            success: true,
            message: "Usuário cadastrado com sucesso",
            data: results
        });
    });
});

// Login

app.post('/login', (request, response) => {
    const email = request.body.email;
    const pass = request.body.pass;

    // Verifica se os campos foram enviados corretamente
    if (!email || !pass) {
        return response.status(400).json({
            success: false,
            message: "Campos de email e senha são obrigatórios.",
        });
    }

    // Cria a query SQL para buscar o usuário
    let query = "SELECT id, name, email, password, perfil FROM users WHERE email = ?";
    let params = [email];  // Adiciona o email nos parâmetros

    connection.query(query, params, (err, results) => {
        if (err) {
            console.error("Erro ao consultar o banco de dados:", err);
            return response.status(500).json({
                success: false,
                message: "Erro no servidor.",
            });
        }

        // Verifica se o email existe no banco
        if (results.length > 0) {
            const senhaDigitada = pass;
            const senhaBanco = results[0].password;

            // Compara a senha enviada com a senha armazenada no banco de dados
            if (senhaBanco === senhaDigitada) {
                return response.status(200).json({
                    success: true,
                    message: "Login realizado com sucesso!",
                    data: results[0],  // Envia os dados do usuário (menos a senha)
                });
            } else {
                return response.status(400).json({
                    success: false,
                    message: "Credenciais inválidas.",
                });
            }
        } else {
            return response.status(400).json({
                success: false,
                message: "Credenciais inválidas.",
            });
        }
    });
});

// Post Feed



// Rota para cadastrar post (com ou sem mídia)
app.post('/post/cadastrar', upload.single('media'), (request, response) => {
    const { titulo, descricao } = request.body;
    const mediaFile = request.file;

    console.log('Recebendo post:', { titulo, descricao });
    console.log('Arquivo:', mediaFile);

    // Validação - apenas título é obrigatório
    if (!titulo) {
        return response.status(400).json({
            success: false,
            message: "Título é obrigatório."
        });
    }

    let type_media = null;
    let media_path = null;

    // Se há arquivo, determinar tipo e salvar caminho
    if (mediaFile) {
        if (mediaFile.mimetype.startsWith('image/')) {
            type_media = 'imagem';
        } else if (mediaFile.mimetype.startsWith('audio/')) {
            type_media = 'audio';
        }
        media_path = mediaFile.filename;
    }

    // Query adaptada para campos opcionais
    let query;
    let params;

    if (media_path && type_media) {
        // Com mídia
        query = "INSERT INTO post (title, description, type_media, media_path) VALUES (?, ?, ?, ?)";
        params = [titulo, descricao, type_media, media_path];
    } else {
        // Sem mídia
        query = "INSERT INTO post (title, description) VALUES (?, ?)";
        params = [titulo, descricao];
    }

    connection.query(query, params, (err, results) => {
        if (err) {
            console.error('Erro MySQL:', err);
            return response.status(500).json({
                success: false,
                message: "Erro no banco de dados"
            });
        }

        response.json({
            success: true,
            message: "Post criado com sucesso!",
            data: {
                id: results.insertId,
                mediaPath: media_path
            }
        });
    });
});

// ROTA PARA BAIXAR ARQUIVOS
app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    // CORRIGIDO: Usar o mesmo caminho da destination do multer
    const filePath = path.join(__dirname, '../uploads', filename);
    
    console.log('=== TENTANDO SERVIR ARQUIVO ===');
    console.log('Filename:', filename);
    console.log('Caminho completo:', filePath);
    console.log('Arquivo existe?', fs.existsSync(filePath));
    
    if (fs.existsSync(filePath)) {
        console.log(' Arquivo encontrado, enviando...');
        res.sendFile(filePath);
    } else {
        console.log(' Arquivo NÃO encontrado:', filePath);
        
        // Listar arquivos na pasta para debug
        const uploadDir = path.join(__dirname, '../uploads');
        if (fs.existsSync(uploadDir)) {
            const files = fs.readdirSync(uploadDir);
            console.log(' Arquivos na pasta uploads:', files);
        } else {
            console.log(' Pasta uploads não existe:', uploadDir);
        }
        
        res.status(404).json({ 
            error: 'Arquivo não encontrado',
            requested: filename,
            path: filePath
        });
    }
});

// Rota post get (listar)

app.get('/posts', (request, response) => {
    const query = `
        SELECT id, title, description, type_media, media_path, 
               DATE_FORMAT(date_criation, '%d/%m/%Y %H:%i') as data_formatada
        FROM post 
        ORDER BY date_criation DESC
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar posts:', err);
            return response.status(500).json({
                success: false,
                message: "Erro ao buscar posts no banco de dados"
            });
        }

        response.json({
            success: true,
            data: results
        });
    });
});

// Youtube API

app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        
        const API_KEY = 'AIzaSyBaSS6uRk9oKILZQhV7LDNj6UDoJZpQl8Q';
        
        const response = await axios.get(
            `https://www.googleapis.com/youtube/v3/search`,
            {
                params: {
                    part: 'snippet',
                    q: q,
                    type: 'video',
                    videoCategoryId: '10', // Categoria música
                    maxResults: 10,
                    key: API_KEY
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Erro na busca:', error);
        res.status(500).json({ error: 'Erro ao buscar vídeos' });
    }
});

// DELETE

app.delete('/usuario/excluir/:id', (request, response) => {
    const userId = request.params.id;

    // Verificar se o ID foi fornecido
    if (!userId) {
        return response.status(400).json({
            success: false,
            message: "ID do usuário é obrigatório."
        });
    }

    // Iniciar transação para garantir que todas as operações sejam realizadas
    connection.beginTransaction((err) => {
        if (err) {
            console.error('Erro ao iniciar transação:', err);
            return response.status(500).json({
                success: false,
                message: "Erro no servidor ao iniciar transação."
            });
        }

        // Primeiro, excluir todos os posts do usuário (se houver relação com usuário)
        const deletePostsQuery = "DELETE FROM post WHERE user_id = ?"; // Ajuste conforme sua estrutura
        connection.query(deletePostsQuery, [userId], (err, results) => {
            if (err) {
                return connection.rollback(() => {
                    console.error('Erro ao excluir posts:', err);
                    response.status(500).json({
                        success: false,
                        message: "Erro ao excluir posts do usuário."
                    });
                });
            }

            console.log(`Posts excluídos: ${results.affectedRows}`);

            // Depois, excluir o usuário
            const deleteUserQuery = "DELETE FROM users WHERE id = ?";
            connection.query(deleteUserQuery, [userId], (err, results) => {
                if (err) {
                    return connection.rollback(() => {
                        console.error('Erro ao excluir usuário:', err);
                        response.status(500).json({
                            success: false,
                            message: "Erro ao excluir conta do usuário."
                        });
                    });
                }

                // Verificar se o usuário foi encontrado e excluído
                if (results.affectedRows === 0) {
                    return connection.rollback(() => {
                        response.status(404).json({
                            success: false,
                            message: "Usuário não encontrado."
                        });
                    });
                }

                // Commit da transação
                connection.commit((err) => {
                    if (err) {
                        return connection.rollback(() => {
                            console.error('Erro ao fazer commit:', err);
                            response.status(500).json({
                                success: false,
                                message: "Erro ao finalizar exclusão da conta."
                            });
                        });
                    }

                    console.log(`Usuário ${userId} excluído com sucesso`);
                    response.json({
                        success: true,
                        message: "Conta excluída com sucesso.",
                        affectedRows: results.affectedRows
                    });
                });
            });
        });
    });
});
