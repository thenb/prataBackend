var app  = require('express')()
var bodyParser  = require('body-parser');
var cors = require('cors');
var mysql = require('mysql');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var q = require('q');
var busboy = require('connect-busboy');
var AWS = require('aws-sdk');
var fs = require('fs');
var CronJob = require('cron').CronJob;


var secret = 'aT42dfdf46GDh6fdp09hmgd35FdsDe';

//bodyparser needs
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json({ extended: true }));
app.use(cors());
app.use(busboy()); 


var pool  = mysql.createPool({
  connectionLimit : 20,
  host     : 'wvulqmhjj9tbtc1w.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  port : '3306',
  user     : 'lk63vtw9t4sfspvm',
  password : 'ui6f7grcioxvim5h',
  database: 'jwl4wmq8nb1xpfr5'
});


app.use(function(err, req, res, next) {
  next(err);
});

//Portal
app.get('/getAllEspecPortal', function(req, res) {	
	pool.getConnection(function(err, connection) {
		var string = 'select l.email,l.url_perfil ,e.id ,e.nome, e.empresa, e.data_nascimento, e.cpf, e.rg,e.telefone, e.celular, e.profissao, e.endereco, e.bairro, e.cep, e.cidade, e.cep from especificador as e, login as l where e.deletado = 0 and l.id_login = e.id_login and e.exibir_portal = 1 order by nome asc';
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}	
			connection.release();
			return res.jsonp(data);
		});
	});
});

app.get('/getHighEspecPortal', function(req, res) {	
	pool.getConnection(function(err, connection) {
		var string = 'select l.email ,l.url_perfil, e.id, e.nome,e.empresa,e.data_nascimento,e.cpf,e.rg,e.telefone,e.celular,e.profissao, e.cep, e.endereco, e.numero, e.bairro, e.cidade, e.uf, (select COALESCE(sum(pontos),0) from pontos where id_especificador = e.id and id_campanha = (SELECT id from campanha where data_fim>NOW() and deletado = 0)) as pontos  from especificador as e, login as l where e.deletado=0 and l.id_login = e.id_login order by pontos desc limit 5';
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}	
			connection.release();
			return res.jsonp(data);
		});
	});
});

app.get('/getAllEspecPortal/:id', function(req, res) {
	pool.getConnection(function(err, connection) {
		console.log(string);
		var string = 'select l.email , l.url_perfil, e.id ,e.nome, e.empresa, e.data_nascimento, e.cpf, e.rg,e.telefone, e.celular, e.profissao, e.endereco, e.bairro, e.cep, e.cidade, e.cep from especificador as e, login as l where e.deletado = 0 and l.id_login = e.id_login and e.id = '+req.params.id;
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();			
			return res.jsonp(data);
		});
	});	
});

app.get('/getCountEmpresasPortal', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'SELECT count(*) from empresa';	
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();	
				return res.jsonp(error);
			}	
			connection.release();	
			return res.jsonp(data);
		});
	});	
});

app.get('/getCountEspecPortal', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'SELECT count(*) from especificador'
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}	
			connection.release();
			return res.jsonp(data);
		});	
	});	
});

//Rotas Abertas Sem autenticação
app.post('/saveEspecPortal', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select count(*) as qtd from login where deletado=0 and email like "'+req.body.user.email+'"';
		console.log(string);
		connection.query(string, function(err, data1) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}		
			if(data1[0].qtd==0){
				var string1 = 'INSERT INTO login (id_tipo_login, email, senha, data_criacao, id_usuario_edicao, bloqueado)VALUES (3, "'+ req.body.user.email+'", "'+ req.body.user.senha+'", NOW(), 1, 1)'
				connection.query(string1, function(err, data2) {
					if (err){
						var error = {};
						error.type = 1;
						error.msg = err;
						connection.release();
						return res.jsonp(error);
					}	
					
					var string2 = 'INSERT INTO especificador (id_login, id_usuario, nome, empresa, data_nascimento, cpf, rg, telefone, cep, endereco, numero, bairro, cidade, uf, data_criacao, data_edicao, bloqueado)VALUES ('+data2.insertId+', 1, "'+ req.body.user.nome.toUpperCase()+'", "'+ req.body.user.empresa.toUpperCase()+'", '+ req.body.user.data_nascimento+', "'+ req.body.user.cpf+'", "'+ req.body.user.rg+'", "'+ req.body.user.telefone+'", "'+ req.body.user.cep+'", "'+ req.body.user.endereco+'", "'+ req.body.user.numero+'", "'+ req.body.user.bairro+'", "'+ req.body.user.cidade+'", "'+ req.body.user.uf+'",NOW(), NOW(),1);'
					console.log(string2);
					connection.query(string2, function(err, data3) {
						if (err){
							var error = {};
							error.type = 1;
							error.msg = err;
							connection.release();
							return res.jsonp(error);
						}
						connection.release();
						return res.jsonp(data3);
					});	  
				});
			}else{
				var error = {};
				error.type = 1;
				error.msg = 'E-mail já cadastrado no sistema.';
				connection.release();
				return res.jsonp(error);
			}			
		});	
	});
});

//login
app.post('/doLogin', function (req, res) {
	pool.getConnection(function(err, connection) {	
		console.log(req.body.user);
		var string = 'select l.email, l.id_tipo_login, l.id_login, l.url_perfil from login as l where l.email like "'+req.body.user.email+'" and l.senha like "'+req.body.user.senha+'" and l.bloqueado = 0 and l.deletado = 0';
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			if (data === 'undefined'|| data.length == 0){
				var error = {};
				error.type = 1;
				error.msg = 'Usuário não cadastrado ou senha incorreta!';
				connection.release();
				return res.jsonp(error);
			}else {		
				if(data[0].id_tipo_login == 3){
					var string1 = 'SELECT * FROM especificador where id_login = '+data[0].id_login;
					console.log(string1)
					connection.query(string1, function(err, data1) {
						if (err){
							var error = {};
							error.type = 1;
							error.msg = err;
							connection.release();
							return res.jsonp(error);
						}
						var user = {};
						user.login = data[0];
						user.login.senha = '';
						user.especificador = data1[0];
						var token = jwt.sign({user: user}, secret, { expiresIn: '60m' });
						connection.release();
						return res.json({ token: token });
					});
				}
				if(data[0].id_tipo_login == 4){
					var string1 = 'SELECT * FROM clientes where id_login = '+data[0].id_login;
					console.log(string1)
					connection.query(string1, function(err, data1) {
						if (err){
							var error = {};
							error.type = 1;
							error.msg = err;
							connection.release();
							return res.jsonp(error);
						}
						var user = {};
						user.login = data[0];
						user.login.senha = '';
						user.cliente = data1[0];
						var token = jwt.sign({user: user}, secret, { expiresIn: '60m' });
						connection.release();
						return res.json({ token: token });
					});
				}
				if(data[0].id_tipo_login == 2){				
					var string1 = 'select e.*, u.nome as responsavel, u.id as usuario_id  from usuario as u, login as l, empresa as e where u.id_login = l.id_login and u.id_empresa = e.id and l.id_login =' +data[0].id_login;
					console.log(string1)
					connection.query(string1, function(err, data1) {
						if (err){
							var error = {};
							error.type = 1;
							error.msg = err;
							connection.release();
							return res.jsonp(error);
						}
						var user = {};
						user.login = data[0];
						user.login.senha = '';
						user.empresa = data1[0];
						var token = jwt.sign({user: user}, secret, { expiresIn: '60m' });
						connection.release();
						return res.json({ token: token });
					});
				}
				if(data[0].id_tipo_login == 1){
					var user = {};
					user.login = data[0];
					user.login.senha = '';				
					var token = jwt.sign({user: user}, secret, { expiresIn: '60m' });
					connection.release();
					return res.json({ token: token });
				}					
			}		
		});	
	});		
});


//esqueci a senha
app.post('/esqueciSenha', function (req, res) {		
	pool.getConnection(function(err, connection) {	
		var string = 'select count(*) as qtd from login where email like "'+req.body.email+'" and deletado = 0 and bloqueado = 0 and email not like "admin@admin.com.br"';
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			if(data[0].qtd>0){
				var senha = Math.floor(Math.random() * 65536);
				console.log(senha);				
				var string = 'update login set senha = '+senha+' where email like "'+req.body.email+'"';
				console.log(string);
				connection.query(string, function(err, data1) {
					if (err){
						var error = {};
						error.type = 1;
						error.msg = err;
						connection.release();
						return res.jsonp(error);
					}					
					
					var assunto = '(Prata da Casa) Recuperar Senha';
					var msg = 'Sua nova senha é: '+senha;
					
					AWS.config.loadFromPath('./configSES.json');
					// Create S3 service object	
					var ses = new AWS.SES({apiVersion: '2010-12-01'});
					// send to list
					var to = [req.body.email]

					// this must relate to a verified SES account
					var from1 = 'noreply@eusoupratadacasa.com.br'

					// this sends the email
					// @todo - add HTML version
					// this sends the email
				// @todo - add HTML version
					ses.sendEmail( { 
					   Source: from1, 
					   Destination: { ToAddresses: to },
					   Message: {
						   Subject: {
							Data: assunto
							},
						   Body: {
							   Text: {
								   Data: msg,
							   }
							}
					   }
					}
					, function(err, data) {
						if(err) {
							var error = {};
							error.type = 1;
							error.msg = err;
							console.log(err)
							connection.release();
							return res.jsonp(error);
						}
							console.log('Email sent:');
							connection.release();
							return res.jsonp('OK')
					 });					
				});	
			}else{
				var error = {};
				error.type = 1;
				error.msg = 'E-mail não está cadastrado no sistema';
				connection.release();
				return res.jsonp(error);			
			}			  
		});
	});	
});

//push noticia
app.post('/pushNovaNoticia', function (req, res) {
	pool.getConnection(function(err, connection) {
		console.log(req.body.data);
		var msg = req.body.msg;
		var titulo = req.body.titulo;
		var url = req.body.url;		
		var string = 'Select * from login where deletado = 0 and bloqueado = 0';
		console.log(string);
		connection.query(string, function(err, logins) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			if(logins.length>0){
				logins.map(function(login) {
					var string = 'INSERT INTO notificacao (data, id_login, msg, titulo, lida, tipo, url) VALUES (NOW(),"'+login.id_login+'","'+msg+'","'+titulo+'" , 0, 7,"'+url+'");'
					console.log(string);
					connection.query(string, function(err, notificacao) {
						if (err){
							var error = {};
							error.type = 1;
							error.msg = err;
							connection.release();
							return res.jsonp(error);
						}
						var string = "SELECT * from dispositivos where id_login = "+login.id_login;
						console.log(string);
						connection.query(string, function(err, disp) {
							if (err){
								var error = {};
								error.type = 1;
								error.msg = err;
								connection.release();
								return res.jsonp(error);
							}
							/*if(disp.length>0){
								disp.map(function(token) {			  
									console.log(token.token);
									AWS.config.loadFromPath('./configSNS.json');
									var sns = new AWS.SNS();			
									sns.createPlatformEndpoint({
									  PlatformApplicationArn: 'arn:aws:sns:sa-east-1:001165068693:app/GCM/PrataDaCasa',
									  Token: token.token
									}, function(err, data) {
									  if (err) {
										return res.jsonp(err.stack);
									  }
									  var endpointArn = data.EndpointArn;
									  var payload = {
										"GCM": "{ \"notification\": { \"text\": \"Nova Notícia!!!\", \"click_action\": \"FCM_PLUGIN_ACTIVITY\" } }"
										}
									
									  // first have to stringify the inner APNS object...
									  payload.APNS = JSON.stringify(payload.APNS);
									  // then have to stringify the entire message payload
									  payload = JSON.stringify(payload);
									  console.log('sending push');
									  sns.publish({
										Message: payload,
										MessageStructure: 'json',
										TargetArn: endpointArn
									  }, function(err, data) {
										if (err) {
										  console.log(err);
										  //return res.jsonp(err.stack);
										}		
										console.log("Push feito: token:"+token.token);	
									  });
									});			
								});	
							}*/							
						});	
					});
				});
				connection.release();
				return res.jsonp('Push feito');
			}else{
				connection.release();
				return res.jsonp('nenhum usuario cadastrado');
			}
		});
	});	
});	



//rotas protegidas
app.use('/api', expressJwt({secret: secret}));

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('invalid token...');
  }
});


app.get('/api/getAllEspec', function(req, res) {
	pool.getConnection(function(err, connection) {	
		connection.query('select e.*, e.id, (select COALESCE(sum(pontos),0) from pontos where id_especificador = e.id and id_campanha = (SELECT id from campanha where data_fim>NOW() and deletado = 0)) as pontos  from especificador as e where e.deletado=0', function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}	
			connection.release();
			return res.jsonp(data);
		});
	});	
});

app.get('/api/getAllEspecForIndicacao', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select e.id, e.nome, e.celular,e.telefone, l.email from especificador as e, login as l where e.id_login = l.id_login and e.deletado = 0'
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}	
			connection.release();
			return res.jsonp(data);
		});
	});	
});

app.get('/api/getAllEspec/:id', function(req, res) {
	pool.getConnection(function(err, connection) {
		connection.query('select e.*, e.id, (select COALESCE(sum(pontos),0) from pontos where id_especificador = e.id)  as pontos from especificador as e where  e.id = '+req.params.id, function(err, data) {
		if (err){
			var error = {};
			error.type = 1;
			error.msg = err;
			connection.release();
			return res.jsonp(error);
		}	
		connection.release();
		return res.jsonp(data);
		});
	});		
});

app.get('/api/getAllEspecBlock', function(req, res) {
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * from especificador where bloqueado = 1', function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}	
			connection.release();
			return res.jsonp(data);
		});
	});		
});

app.post('/api/getAllPontByCampId', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'SELECT p.pontos, p.data_criacao, p.observacao as descricao, e.nome  FROM pontos as p, usuario as u, empresa as e where id_campanha = (SELECT id from campanha where data_fim>NOW()  and deletado = 0) and id_especificador ='+req.body.id_especificador+' and p.id_usuario = u.id and e.id = u.id_empresa and p.id_campanha =' +req.body.id_campanha;  
		console.log(string);
		connection.query(string , function(err, data) {
		if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});
	});	
});

app.get('/api/getIdCampAtiva', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'SELECT id from campanha where data_fim>NOW() and deletado = 0';  
		console.log(string);
		connection.query(string , function(err, data) {
		if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});
	});	
});

app.post('/api/getAllPointsCampanhaAtiva', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'SELECT p.pontos, p.data_criacao, p.observacao as descricao, e.nome  FROM pontos as p, usuario as u, empresa as e where id_campanha = (SELECT id from campanha where data_fim>NOW() and deletado = 0) and id_especificador ='+req.body.id_especificador+' and p.id_usuario = u.id and e.id = u.id_empresa and p.id_campanha = (SELECT id from campanha where data_fim>NOW() and deletado = 0)';  
		console.log(string);
		connection.query(string , function(err, data) {
		if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});
	});	
});

app.post('/api/getAllPointsByEspecId', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'SELECT p.pontos, p.data_criacao, p.observacao as descricao, e.nome  FROM pontos as p, usuario as u, empresa as e where id_especificador ='+req.body.espec_id+' and p.id_usuario = u.id and e.id = u.id_empresa and p.id_campanha = (SELECT id from campanha where data_fim>NOW() and deletado = 0) order by data_criacao desc'
		console.log(string);
		connection.query(string , function(err, data) {
		if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});	
	});	
});



app.post('/api/getAllPontByIdEspec', function(req, res){
	pool.getConnection(function(err, connection) {
		var string = 'SELECT p.pontos, p.data_criacao, p.observacao as descricao, e.nome  FROM pontos as p, usuario as u, empresa as e where id_campanha = (SELECT id from campanha where data_fim>NOW() and deletado = 0) and id_especificador ='+req.body.id_especificador+' and p.id_usuario = u.id and e.id = u.id_empresa'; 
		console.log(string);
		connection.query(string  , function(err, data) {
		 if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}	
			connection.release();
			return res.jsonp(data);
		});	
	});		
});


//especificador
app.post('/api/saveEspec', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select count(*) as qtd from login where deletado=0 and email like "'+req.body.especificador.email+'"';
		console.log(string);
		connection.query(string, function(err, data1) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}		
			if(data1[0].qtd==0){

				if(typeof req.body.especificador.senha == 'undefined'){
					req.body.especificador.senha = Math.floor(Math.random() * 65536);					
				}
			
				var string = 'INSERT INTO login (id_tipo_login, email, senha, data_criacao, id_usuario_edicao, bloqueado)VALUES (3, "'+ req.body.especificador.email+'", "'+req.body.especificador.senha+'", NOW(), 1, 0)'
				connection.query(string, function(err, data) {
					if (err){
						var error = {};
						error.type = 1;
						error.msg = err;
						connection.release();
						return res.jsonp(error);
					}	
					if(typeof req.body.especificador.dados_bancarios == 'undefined'){
						req.body.especificador.dados_bancarios = "";
					}
					if(typeof req.body.especificador.profissao == 'undefined'){
						req.body.especificador.profissao = "";
					}	
					if(typeof req.body.especificador.celular == 'undefined'){
						req.body.especificador.celular = "";
					}
					if(typeof req.body.especificador.sobrenome == 'undefined'){
						req.body.especificador.sobrenome = "";
					}
					
					
					var string = 'INSERT INTO especificador (id_login, id_usuario, nome, sobrenome, empresa, data_nascimento, cpf, rg, telefone, celular, profissao, estado_civil, endereco, bairro, cep, cidade, uf, dados_bancarios, observacoes, data_criacao, data_edicao, bloqueado, numero)VALUES ('+data.insertId+', 1, "'+ req.body.especificador.nome.toUpperCase()+'","'+ req.body.especificador.sobrenome.toUpperCase()+'" ,"'+ req.body.especificador.empresa.toUpperCase()+'", "'+req.body.especificador.data_nascimento+'" , "'+ req.body.especificador.cpf+'" , "'+ req.body.especificador.rg.toUpperCase()+'" , "'+ req.body.especificador.telefone+'", "'+ req.body.especificador.celular+'", "'+ req.body.especificador.profissao+'", 1, "'+ req.body.especificador.endereco.toUpperCase()+'", "'+ req.body.especificador.bairro.toUpperCase()+'", "'+ req.body.especificador.cep+'", "'+req.body.especificador.cidade.toUpperCase()+'","'+req.body.especificador.uf.toUpperCase()+'", "'+ req.body.especificador.dados_bancarios+'", "observado", NOW(), NOW(),  0,"'+req.body.especificador.numero+'");'
					console.log(string);
					connection.query(string, function(err, data) {
						if (err){
							var error = {};
							error.type = 1;
							error.msg = err;
							connection.release();
							return res.jsonp(error);
						}
						console.log(data);
						connection.release();
						data.senhaRetorno = req.body.especificador.senha;
						data.emailRetorno = req.body.especificador.email
						return res.jsonp(data);
					});	  
				});	
			}else{
				var error = {};
				error.type = 1;
				error.msg = 'E-mail já cadastrado no sistema.';
				connection.release();
				return res.jsonp(error);
			}
		}); 
	});			 
});


app.post('/api/desativarespec', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set exibir_portal =0  where id = '+req.body.id_espec;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/ativarespec', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set exibir_portal =1  where id = '+req.body.id_espec;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});



app.post('/api/especificadorUpdateNome', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set nome ="'+req.body.nome.toUpperCase()+'" where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');			
		});
	});	
});

app.post('/api/especificadorUpdateSobrenome', function (req, res) {
	pool.getConnection(function(err, connection) {
		if(typeof req.body.sobrenome == 'undefined'){
			req.body.sobrenome = '';
		}		
		var string = 'update especificador set sobrenome ="'+req.body.sobrenome.toUpperCase()+'" where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');			
		});
	});	
});

app.post('/api/especificadorUpdateEmpresa', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set empresa ="'+req.body.empresa.toUpperCase()+'" where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');			
		});	
	});		
});

app.post('/api/especificadorUpdateEmail', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update login set email ="'+req.body.email+'" where id_login = '+req.body.id_login;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');			
		});
	});		
});

app.post('/api/especificadorUpdateNascimento', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set data_nascimento ="'+req.body.data_nascimento+'" where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();	
			return res.jsonp('ok');			
		});
	});	
});

app.post('/api/especificadorUpdateCpf', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set cpf ="'+req.body.cpf+'" where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();	
				return res.jsonp(error);
			}
			connection.release();	
			return res.jsonp('ok');			
		});	
	});	
});

app.post('/api/especificadorUpdateRg', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set rg ="'+req.body.rg.toUpperCase()+'" where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();	
				return res.jsonp(error);
			}
			connection.release();		
			return res.jsonp('ok');			
		});
	});	
});

app.post('/api/especificadorUpdateTelefone', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set telefone ="'+req.body.telefone+'" where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();		
				return res.jsonp(error);
			}
			connection.release();			
			return res.jsonp('ok');			
		});	
	});
});

app.post('/api/especificadorUpdateCelular', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set celular ="'+req.body.celular+'" where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();	
			return res.jsonp('ok');			
		});
	});	
});

app.post('/api/especificadorUpdateProfissao', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set profissao ="'+req.body.profissao+'" where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();	
				return res.jsonp(error);
			}
			connection.release();	
			return res.jsonp('ok');			
		});
	});		
});

app.post('/api/especificadorUpdateEstadoCivil', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set estado_civil ="'+req.body.estado_civil+'" where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');			
		});
	});	
});

app.post('/api/especificadorUpdateCep', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set cep ="'+req.body.cep+'" where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');			
		});	
	});
});

app.post('/api/especificadorUpdateEndereco', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set endereco ="'+req.body.endereco.toUpperCase()+'" where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');			
		});	
	});	
});

app.post('/api/especificadorUpdateNumero', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set numero ="'+req.body.numero+'" where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();	
			return res.jsonp('ok');			
		});
	});	
});

app.post('/api/especificadorUpdateBairro', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set bairro ="'+req.body.bairro.toUpperCase()+'" where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();	
			return res.jsonp('ok');			
		});
	});		
});

app.post('/api/especificadorUpdateCidade', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set cidade ="'+req.body.cidade.toUpperCase()+'" where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();	
				return res.jsonp(error);
			}
			connection.release();	
			return res.jsonp('ok');			
		});
	});		
});

app.post('/api/especificadorUpdateUf', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set uf ="'+req.body.uf+'" where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();	
				return res.jsonp(error);
			}
			connection.release();	
			return res.jsonp('ok');			
		});
	});	
});

app.post('/api/especificadorUpdateDados', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set dados_bancarios ="'+req.body.dados_bancarios+'" where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();	
				return res.jsonp(error);
			}
			connection.release();	
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/especificadorUpdateNumero', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set numero ="'+req.body.numero+'" where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/especificadorUpdateSenha', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update login set senha ="'+req.body.senha+'" where id_login = '+req.body.id_login;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});
});

app.post('/api/excluirEspec', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set deletado =1  where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});
});

app.post('/api/aprovarEspec', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set bloqueado = 0  where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			var string1 = 'update login set bloqueado = 0  where id_login = '+req.body.id_login;
			console.log(string1);
			connection.query(string1, function(err, data) {
				if (err){
					var error = {};
					error.type = 1;
					error.msg = err;
					connection.release();
					return res.jsonp(error);
				}
				connection.release();
				return res.jsonp('ok');		
			});	
		});	
	});	
});

app.post('/api/desaprovarEspec', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update especificador set deletado = 1  where id = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/getLoginEspec', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select * from login where id_login ='+req.body.id_login;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();			
			return res.jsonp(data);	
		});
	});	
});



//empresas
app.post('/api/saveEmpre', function (req, res) {	 
	pool.getConnection(function(err, connection) {
		var string = 'select count(*) as qtd from login where deletado=0 and email like "'+req.body.empresa.email+'"';
		console.log(string);
		connection.query(string, function(err, data1) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}		
			if(data1[0].qtd==0){
				if(typeof req.body.empresa.celular == 'undefined'){
					req.body.empresa.celular = "";
				}
				var string = 'INSERT INTO empresa (nome, segmento, data_criacao, telefone, celular, cep, endereco, numero, bairro, cidade, uf, bloqueado, deletado)VALUES("'+req.body.empresa.nome+'","'+req.body.empresa.segmento+'",NOW(), "'+req.body.empresa.telefone+'" , "'+req.body.empresa.celular+'",  "'+req.body.empresa.cep+'", "'+req.body.empresa.endereco+'","'+req.body.empresa.numero+'", "'+req.body.empresa.bairro+'", "'+req.body.empresa.cidade+'", "'+req.body.empresa.uf+'",0,0);'
				console.log(string);
				connection.query(string, function(err, data) {
					if (err){
						var error = {};
						error.type = 1;
						error.msg = err;
						connection.release();
						return res.jsonp(error);
					}	

					if(typeof req.body.empresa.senha == 'undefined'){
						req.body.empresa.senha = Math.floor(Math.random() * 65536);						
					}
					var string = 'INSERT INTO login (id_tipo_login, email, senha, data_criacao, id_usuario_edicao, bloqueado)VALUES (2, "'+ req.body.empresa.email+'", "'+ req.body.empresa.senha+'", NOW(), 1, 0)';
					console.log(string);
					connection.query(string, function(err, data1) {
						console.log(data1);
						if (err){
							var error = {};
							error.type = 1;
							error.msg = err;
							connection.release();
							return res.jsonp(error);
						}	
						var string = 'INSERT INTO usuario (id_empresa, id_login, nome,data_criacao, bloqueado)VALUES ('+data.insertId+', '+ data1.insertId+',"'+req.body.empresa.nome_usuario+'", NOW(),0)';
						console.log(string);
						connection.query(string, function(err, data2) {
							if (err){
								var error = {};
								error.type = 1;
								error.msg = err;
								connection.release();
								return res.jsonp(error);
							}
							connection.release();
							data1.senhaRetorno = req.body.empresa.senha;
							data1.emailRetorno = req.body.empresa.email
							return res.jsonp(data1);
						});
					});		
				});	
			}else{
				var error = {};
				error.type = 1;
				error.msg = 'E-mail já cadastrado no sistema.';
				connection.release();
				return res.jsonp(error);
			}	
		});	
	});		
});

app.post('/api/excluirEmpre', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update empresa set deletado =1  where id = '+req.body.id_empresa;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/desativarEmpre', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update empresa set status_ativo =0  where id = '+req.body.id_empresa;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/ativarEmpre', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update empresa set status_ativo =1  where id = '+req.body.id_empresa;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.get('/api/getAllEmpresas', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'SELECT e.*, l.id_login, (select count(*) from clientes as c where c.empresa = e.id) as qtdIndicacoes , (select count(*) from presenca_x_empresa as pe where pe.id_empresa = e.id) as qtdPresenca, (select COALESCE(sum(pontos),0) from pontos as p where p.id_campanha = (select id from campanha where data_fim>NOW() and deletado = 0)  and p.id_usuario = u.id) as pontosEmpresa from empresa as e, usuario as u, login as l where e.deletado=0 and e.nome not like "admin" and e.id = u.id_empresa and u.id_login = l.id_login and l.deletado = 0';
		console.log(string)
		connection.query(string, function(err, data) {	
		  if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});
	});	
});

app.post('/api/getInfoEmpresa', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select u.nome as nome, u.id as id_usuario , l.email, l.id_login from usuario as u, login as l where u.id_empresa = '+req.body.id_empresa+' and u.id_login = l.id_login and l.deletado = 0 and u.deletado = 0';
		console.log(string);
		connection.query( string, function(err, data) {
		  if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});
	});
});




app.post('/api/empresaUpdateNome', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update empresa set nome ="'+req.body.nome+'" where id = '+req.body.id_empresa;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/empresaUpdateEmail', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update login set email ="'+req.body.email+'" where id_login = '+req.body.id_login;	
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/empresaUpdateSegmento', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update empresa set segmento ="'+req.body.segmento+'" where id = '+req.body.id_empresa;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/empresaUpdateCep', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update empresa set cep ="'+req.body.cep+'" where id = '+req.body.id_empresa;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/empresaUpdateEndereco', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update empresa set endereco ="'+req.body.endereco+'" where id = '+req.body.id_empresa;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});
});

app.post('/api/empresaUpdateNumero', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update empresa set numero ="'+req.body.numero+'" where id = '+req.body.id_empresa;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/empresaUpdateBairro', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update empresa set bairro ="'+req.body.bairro+'" where id = '+req.body.id_empresa;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/empresaUpdateCidade', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update empresa set cidade ="'+req.body.cidade+'" where id = '+req.body.id_empresa;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/empresaUpdateUf', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update empresa set uf ="'+req.body.uf+'" where id = '+req.body.id_empresa;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});	
	});
});

app.post('/api/empresaUpdateNomeUsuario', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update usuario set nome ="'+req.body.nome_usuario+'" where id_empresa = '+req.body.id_empresa;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});	
	});	
});

app.post('/api/empresaUpdateTelefone1', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update empresa set telefone ="'+req.body.telefone+'" where id = '+req.body.id_empresa;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/empresaUpdateTelefone2', function (req, res) {
	pool.getConnection(function(err, connection) {
		if(typeof req.body.celular == 'undefined'){
			req.body.celular = "";
		}	
		var string = 'update empresa set celular ="'+req.body.celular+'" where id = '+req.body.id_empresa;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});	
	});	
});

app.post('/api/getAllPontosByEmpresa', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select * from pontos where id_usuario = '+req.body.id_usuario + ' and id_campanha = (select id from campanha where data_fim>NOW() and deletado = 0) order by data_criacao desc'
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});	
	});	
});





//campanhas
app.post('/api/campanhaUpdateNome', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update campanha set nome ="'+req.body.nome+'" where id = '+req.body.id_campanha;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});	
	});	
});

app.post('/api/campanhaUpdateDataInicio', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update campanha set data_inicio ="'+req.body.data_inicio+'" where id = '+req.body.id_campanha;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/campanhaUpdateDataFim', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select * from campanha where data_fim>NOW() and deletado = 0 and id != '+ req.body.id_campanha;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}	
			if(data.length==0){
				var string1 = 'update campanha set data_fim ="'+req.body.data_fim+'" where id = '+req.body.id_campanha;
				console.log(string1);
				connection.query(string1, function(err, data) {
					if (err){
						var error = {};
						error.type = 1;
						error.msg = err;
						connection.release();
						return res.jsonp(error);
					}
					connection.release();
					return res.jsonp('ok');		
				});
			}else{
				var error = {};
				error.type = 1;
				error.msg = 'Já existe uma campanha ativa no sistema.';
				connection.release();
				return res.jsonp(error);	
			}
		});		
	});	
});


app.post('/api/campanhaUpdateRegulamento', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update campanha set regulamento ="'+req.body.regulamento+'" where id = '+req.body.id_campanha;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});	
	});	
});

app.post('/api/saveCampanha', function (req, res) {	 	
	pool.getConnection(function(err, connection) {
		var string = 'select * from campanha where data_fim>NOW() and deletado = 0'
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}	
			if(data.length==0){
				var string1 = 'INSERT INTO campanha (data_inicio, data_fim, nome, data_criacao, regulamento, deletado)VALUES ("'+req.body.campanha.data_inicio+'","'+req.body.campanha.data_fim+'","'+req.body.campanha.nome+'",NOW(),"'+req.body.campanha.regulamento+'",0);'
				console.log(string);
				connection.query(string1, function(err, data1) {
					if (err){
						var error = {};
						error.type = 1;
						error.msg = err;
						connection.release();
						return res.jsonp(error);
					}
					connection.release();
					return res.jsonp(data1);
				});
			}else{
				var error = {};
				error.type = 1;
				error.msg = 'Já existe uma campanha ativa no sistema.';
				connection.release();
				return res.jsonp(error);	
			}
		});
	});		
});

app.get('/api/getAllCamp', function(req, res) {
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * from campanha where deletado = 0 order by data_fim desc', function(err, data) {
		  if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});
	});	
});

app.post('/api/excluirCampanha', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update campanha set deletado =1  where id = '+req.body.id_campanha;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});


app.post('/api/getUserById', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select e.nome, (select id_tipo_login from login where id_login = '+req.body.user+') as id_tipo_user , (select email from login where id_login = '+req.body.user+') as email from especificador as e where e.id_login ='+req.body.user;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);		
		});		
	});		
});


//clientes
app.get('/api/getAllClientes', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'SELECT c.*, l.email, l.id_tipo_login, l.id_login, e.nome as nomeEmpresa FROM clientes as c, login as l, empresa as e where l.id_login = c.id_login and c.deletado = 0 and e.id = c.empresa order by c.data_criacao asc';
		console.log(string);
		connection.query(string, function(err, data) {
		  if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});	
	});
});

app.post('/api/saveCliente', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select count(*) as qtd from login where deletado=0 and email like "'+req.body.cliente.email+'"';
		console.log(string);
		connection.query(string, function(err, data1) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}		
			if(data1[0].qtd==0){
				if(typeof req.body.cliente.fase1 == 'undefined'){
					 req.body.cliente.fase1 = false;
				 }
				 
				 if(typeof req.body.cliente.fase2 == 'undefined'){
					 req.body.cliente.fase2 = false;
				 }
				 
				 if(typeof req.body.cliente.fase3 == 'undefined'){
					 req.body.cliente.fase3 = false;
				 }
				 
				 if(typeof req.body.cliente.fase4 == 'undefined'){
					 req.body.cliente.fase4 = false;
				 }
				 
				 if(typeof req.body.cliente.fase5 == 'undefined'){
					 req.body.cliente.fase5 = false;
				 }
				 
				 if(typeof req.body.cliente.fase6 == 'undefined'){
					 req.body.cliente.fase6 = false;
				 }
				 
				 if(typeof req.body.cliente.fase7 == 'undefined'){
					 req.body.cliente.fase7 = false;
				 }
				 
				 if(typeof req.body.cliente.fase8 == 'undefined'){
					 req.body.cliente.fase8 = false;
				 }
				 
				 if(typeof req.body.cliente.fase9 == 'undefined'){
					 req.body.cliente.fase9 = false;
				 }

				 if(typeof req.body.cliente.nome_empreiteiro == 'undefined'){
					 req.body.cliente.nome_empreiteiro="";
				 }
				 
				 if(typeof req.body.cliente.telefone2_empreiteiro == 'undefined'){
					req.body.cliente.telefone2_empreiteiro="";
				 }
				 
				 if(typeof req.body.cliente.telefone == 'undefined'){
					req.body.cliente.telefone="";
				 }
				 
				 if(typeof req.body.cliente.celular == 'undefined'){
					req.body.cliente.celular="";
				 }
				 
				 if(typeof req.body.cliente.telefone1_empreiteiro == 'undefined'){
					req.body.cliente.telefone1_empreiteiro="";
				 }
				 
				 if(typeof req.body.cliente.observacoes == 'undefined'){
					req.body.cliente.observacoes="";
				 }
				 if(typeof req.body.cliente.id_especificador == 'undefined'){
					req.body.cliente.id_especificador=null;
				 }
				 
				 if(typeof req.body.cliente.endereco == 'undefined'){
					req.body.cliente.endereco="";
				 }
				 
				 if(typeof req.body.cliente.bairro == 'undefined'){
					req.body.cliente.bairro="";
				 }
				 
				 if(typeof req.body.cliente.cidade == 'undefined'){
					req.body.cliente.cidade="";
				 }
				 
				 if(typeof req.body.cliente.uf == 'undefined'){
					req.body.cliente.uf="";
				 }
				 
				 if(typeof req.body.cliente.cep == 'undefined'){
					req.body.cliente.cep="";
				 }
				 
				 if(typeof req.body.cliente.numero == 'undefined'){
					req.body.cliente.numero=null;
				 }
				 
				  if(typeof req.body.cliente.senha == 'undefined'){
					req.body.cliente.senha= Math.floor(Math.random() * 65536);
					
				 }		 
				 if(typeof req.body.cliente.sobrenome == 'undefined'){
					req.body.cliente.sobrenome='';
				 }
				 
				 var string = 'INSERT INTO login (id_tipo_login, email, senha, data_criacao, id_usuario_edicao, bloqueado)VALUES (4, "'+ req.body.cliente.email+'", "'+ req.body.cliente.senha+'", NOW(), 1, 0)'
				 console.log(string);
				 connection.query(string, function(err, data) {
					if (err){
						var error = {};
						error.type = 1;
						error.msg = err;
						connection.release();
						return res.jsonp(error);
					}	
					
					var string = 'INSERT INTO clientes (id_indicou, id_login,  nome, sobrenome ,empresa,telefone, celular, endereco, bairro, cep, cidade, uf, numero, id_especificador, nome_empreiteiro, telefone1_empreiteiro, telefone2_empreiteiro, observacoes ,data_criacao,  data_edicao, deletado, fase1, fase2, fase3, fase4, fase5, fase6, fase7, fase8, fase9, tipo_id_indicou, data_nascimento, tipo, terrea)VALUES('+req.body.cliente.id_indicou+', '+data.insertId+', "'+req.body.cliente.nome.toUpperCase()+'", "'+req.body.cliente.sobrenome.toUpperCase()+'" ,'+ req.body.cliente.empresa+', "'+ req.body.cliente.telefone+'", "'+ req.body.cliente.celular+'","'+ req.body.cliente.endereco.toUpperCase()+'", "'+ req.body.cliente.bairro.toUpperCase()+'", "'+ req.body.cliente.cep+'", "'+req.body.cliente.cidade.toUpperCase()+'","'+req.body.cliente.uf.toUpperCase()+'","'+req.body.cliente.numero+'" ,"'+req.body.cliente.id_especificador+'" , "'+ req.body.cliente.nome_empreiteiro.toUpperCase()+'" , "'+ req.body.cliente.telefone1_empreiteiro+'" ,"'+ req.body.cliente.telefone2_empreiteiro+'" , "'+ req.body.cliente.observacoes+'",NOW(),NOW(), 0,'+ req.body.cliente.fase1+','+ req.body.cliente.fase2+','+ req.body.cliente.fase3+','+ req.body.cliente.fase4+','+ req.body.cliente.fase5+','+ req.body.cliente.fase6+','+ req.body.cliente.fase7+','+ req.body.cliente.fase8+','+ req.body.cliente.fase9+','+ req.body.cliente.tipo_id_indicou+',"'+ req.body.cliente.data_nascimento+'","'+ req.body.cliente.tipo+'","'+ req.body.cliente.terrea+'");'
					console.log(string);
					connection.query(string, function(err, data1) {
						if (err){
							var error = {};
							error.type = 1;
							error.msg = err;
							connection.release();
							return res.jsonp(error);
						}
						connection.release();
						data.senhaRetorno = req.body.cliente.senha;
						data.emailRetorno = req.body.cliente.email
						return res.jsonp(data);
					});	  
				});	
			}else{
				var error = {};
				error.type = 1;
				error.msg = 'E-mail já cadastrado no sistema.';
				connection.release();
				return res.jsonp(error);
			}
		});	
	});	
});

app.post('/api/excluirCliente', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set deletado =1  where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/clienteUpdateNome', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set nome ="'+req.body.nome+'" where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/clienteUpdateSobrenome', function (req, res) {
	pool.getConnection(function(err, connection) {
		if(typeof req.body.sobrenome =='undefined'){
			req.body.sobrenome='';
		}
		var string = 'update clientes set sobrenome ="'+req.body.sobrenome.toUpperCase()+'" where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/clienteUpdateEmpresa', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set empresa ="'+req.body.empresa+'" where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/clienteUpdateDataNascimento', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set data_nascimento ="'+req.body.data_nascimento+'" where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/clienteUpdateCelular', function (req, res) {
	pool.getConnection(function(err, connection) {
		if(typeof req.body.celular == "undefined"){
			req.body.celular = "";
		}
		
		var string = 'update clientes set celular ="'+req.body.celular+'" where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/clienteUpdateTelefone', function (req, res) {
	pool.getConnection(function(err, connection) {
		if(typeof req.body.telefone == "undefined"){
			req.body.telefone = "";
		}
		
		var string = 'update clientes set telefone ="'+req.body.telefone+'" where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/clienteUpdateCep', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set cep ="'+req.body.cep+'" where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/clienteUpdateEndereco', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set endereco ="'+req.body.endereco+'" where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/clienteUpdateBairro', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set bairro ="'+req.body.bairro+'" where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/clienteUpdateNumero', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set numero ="'+req.body.numero+'" where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/clienteUpdateCidade', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set cidade ="'+req.body.cidade+'" where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/clienteUpdateUf', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set uf ="'+req.body.uf+'" where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/clienteUpdateFase1', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set fase1 ='+req.body.fase1+' where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/clienteUpdateFase2', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set fase2 ='+req.body.fase2+' where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/clienteUpdateFase3', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set fase3 ='+req.body.fase3+' where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/clienteUpdateFase4', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set fase4 ='+req.body.fase4+' where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});	
	});	
});

app.post('/api/clienteUpdateFase5', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set fase5 ='+req.body.fase5+' where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/clienteUpdateFase6', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set fase6 ='+req.body.fase6+' where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});	
	});	
});

app.post('/api/clienteUpdateFase7', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set fase7 ='+req.body.fase7+' where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});	
	});		
});

app.post('/api/clienteUpdateFase8', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set fase8 ='+req.body.fase8+' where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});	
	});		
});

app.post('/api/clienteUpdateFase9', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set fase9 ='+req.body.fase9+' where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/clienteUpdateTipo', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set tipo ='+req.body.tipo+' where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/clienteUpdateTerrea', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set terrea ='+req.body.terrea+' where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/clienteUpdateEspecificador', function (req, res) {
	pool.getConnection(function(err, connection) {
		if(typeof req.body.id_especificador == 'undefined'){
			req.body.id_especificador = null;
		}	
		var string = 'update clientes set id_especificador ='+req.body.id_especificador+' where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/clienteUpdateNomeEmpreiteiro', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set nome_empreiteiro ="'+req.body.nome_empreiteiro+'" where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/clienteUpdateTelefone1Empreiteiro', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set telefone1_empreiteiro ="'+req.body.telefone1_empreiteiro+'" where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/clienteUpdateTelefone2Empreiteiro', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set telefone2_empreiteiro ="'+req.body.telefone2_empreiteiro+'" where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release()
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});


app.post('/api/clienteUpdateNomeResponsavel', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set nome_responsavel ="'+req.body.nome_responsavel+'" where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/clienteUpdateObservacoes', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set observacoes ="'+req.body.observacoes+'" where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});	
});

app.post('/api/aceiteCliente', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update clientes set aceite ="1" where id = '+req.body.id_cliente;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			console.log(data);
			return res.jsonp(data);		
		});
	});		
});

//pontuacao

app.post('/api/novaPontuacao', function (req, res) {	 
	pool.getConnection(function(err, connection) {
		var string = 'INSERT INTO pontos (id_especificador, id_campanha, id_usuario, pontos, observacao, data_criacao)VALUES ("'+req.body.id_espec+'","'+req.body.id_campanha+'","'+req.body.id_usuario+'",'+req.body.pontuacao.valor+',"'+req.body.pontuacao.descricao+'",NOW());'
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}	
			connection.release();
			return res.jsonp(data);
		});
	});		
});

app.post('/api/excluirPontuacao', function (req, res) {	 
	pool.getConnection(function(err, connection) {
		var string = 'delete from pontos where id = '+req.body.id_pontuacao;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}	
			connection.release();
			return res.jsonp(data);
		});
	});		
});


app.get('/api/getCampanhaAtiva', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'SELECT id from campanha where data_fim>NOW() and deletado = 0';
		console.log(string);
		connection.query(string, function(err, data) {
		  if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});
	});		
});

//presenca

function insertPresentes(presente, id_presenca, connection) {			
	var deffered  = q.defer();		
	var string = 'INSERT INTO presenca_x_empresa (id_empresa,id_presenca)VALUES ('+presente.id+','+id_presenca+');'
	console.log(string);
		connection.query(string, function(err, data) {
		if (err){
			var error = {};
			error.type = 1;
			error.msg = err;
			connection.release();
			return res.jsonp(error);
		}		
		deffered.resolve(data);
		});
		return deffered.promise;
}



app.post('/api/cadastrarPresenca', function (req, res) {	 
	pool.getConnection(function(err, connection) {
		var string = 'INSERT INTO presenca (data, nome, descricao)VALUES (NOW(),"'+req.body.presenca.nome+'","'+req.body.presenca.descricao+'");'
		var promises = [];	
		console.log(string);
		console.log(req.body.presentes);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			var presentes = req.body.presentes;		
			presentes.map(function(presente) {			  
				 promises.push(insertPresentes(presente, data.insertId, connection));	
			});
			
			q.all(promises).then(function (pgeneralCount) {
				connection.release();
				return res.jsonp('ok');
			});			
		});	
	});		
});

app.post('/api/getAllPresencaByEmpresa', function (req, res) {	 
	pool.getConnection(function(err, connection) {
		var string = 'select count(*) as qtdPresencaCampanhaAtiva from campanha as c, presenca as p, presenca_x_empresa ep where p.data>c.data_inicio and p.data<c.data_fim and c.id = (select id from campanha where data_fim>NOW()) and ep.id_presenca = p.id and ep.id_empresa = '+req.body.id_empresa;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);	
		});	
	});		
});

app.get('/api/getTotalPresenca', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select * from presenca';
		console.log(string);
		connection.query(string, function(err, data) {
		  if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});	
	});		
});



//visitas
app.post('/api/cadastrarVisita', function (req, res) {	 
	pool.getConnection(function(err, connection) {
		var string = 'insert into visita(id_empresa, data, id_login) values('+req.body.id_login_empresa+',NOW(),'+req.body.visita.id_login+')'
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});
	});		
});

app.post('/api/getAllEmpresasVisited', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select e.*, v.data from visita as v, usuario as u, empresa as e where v.id_login = '+req.body.id_login+' and v.id_empresa = u.id_login and e.id = u.id_empresa group by e.id order by e.nome'
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});	
	});	
});

app.get('/api/getAllEspecAndLogin', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select e.*, l.id_login from especificador as e, login as l where e.deletado = 0 and e.id_login = l.id_login'
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});	
	});	
});

app.get('/api/getAllClienteAndLogin', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select c.*, l.id_login from clientes as c, login as l where c.deletado = 0 and c.id_login = l.id_login'
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});	
	});	
});



app.post('/api/getAllVisitasLoginId', function(req, res) {
	pool.getConnection(function(err, connection) {
		
		var string = 'SELECT e.nome as nomeEmpresa ,v.data FROM visita as v, login as l, usuario as u, empresa as e where v.id_login = '+req.body.id_login+' and l.id_login = v.id_empresa and u.id_login = l.id_login and e.id = u.id_empresa';
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});
	});	
});

//Premios
app.get('/api/getAllPremiosCampanhaAtiva', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select * from premio where id_campanha in (select id from campanha where data_fim>NOW() and deletado = 0) and deletado = 0 order by pontos desc'
		
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});	
	});		
});

app.post('/api/getAllPremiosByCampanhaId', function(req, res) {
	pool.getConnection(function(err, connection) {		
		var string = 'select * from premio where id_campanha ='+req.body.id+' order by pontos desc';
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});
	});	
});

app.post('/api/savePremio', function (req, res) {	 
	pool.getConnection(function(err, connection) {
		var string = 'insert into premio(id_campanha, nome, descricao, pontos, data_criacao) values((select id from campanha where data_fim>NOW() and deletado = 0),"'+req.body.premio.nome+'","'+req.body.premio.descricao+'",'+req.body.premio.pontos+',NOW())';
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}	
			connection.release();
			return res.jsonp(data);
		});
	});		
});

app.get('/api/getDadosCampanhaAtiva', function (req, res) {	 
	pool.getConnection(function(err, connection) {
		var string = 'select * from campanha where data_fim>NOW() and deletado = 0';
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}	
			connection.release();
			return res.jsonp(data);
		});
	});		
});

app.post('/api/premioUpdateNome', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update premio set nome ="'+req.body.nome+'" where id = '+req.body.id_premio;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});	
	});		
});

app.post('/api/premioUpdateDescricao', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update premio set descricao ="'+req.body.descricao+'" where id = '+req.body.id_premio;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/premioUpdatePontos', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update premio set pontos ='+req.body.pontos+' where id = '+req.body.id_premio;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});

app.post('/api/excluirPremio', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update premio set deletado =1  where id = '+req.body.id_premio;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp('ok');		
		});
	});		
});


//dashboard
app.post('/api/getTotalIndicacoes', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select count(*) as qtd from clientes where deletado = 0 and id_indicou = '+req.body.id_especificador;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();	
			return res.jsonp(data)
		});
	});		
});

app.post('/api/getTotalIndicacoesEmpresa', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select count(*) as qtdIndicacaoEmpresa from clientes where empresa = '+req.body.id_empresa;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();	
				return res.jsonp(error);
			}
			connection.release();	
			return res.jsonp(data)
		});	
	});		
});

app.get('/api/getTotalEspec', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select count(*)  as qtd  from especificador where deletado = 0'
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();	
				return res.jsonp(error);
			}
			connection.release();	
			return res.jsonp(data);
		});
	});		
});

app.get('/api/getTotalClientes', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select count(*)  as qtd  from clientes where deletado = 0'
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});
	});		
});

app.get('/api/getTotalEmpresas', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select count(*) as qtd from empresa where deletado = 0 and bloqueado = 0 and nome not like "admin"'
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});
	});	
});

app.post('/api/getTotalPontosEmpresa', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select pontos from pontos where id_campanha =(select id from campanha where data_fim>NOW() and deletado = 0) and id_usuario = '+req.body.id_usuario;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();	
				return res.jsonp(error);
			}
			connection.release();	
			return res.jsonp(data)
		});	
	});		
});




//perfil
app.post('/api/perfilUpdateSenha', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update login set senha = "'+req.body.senha+'" where id_login = '+req.body.id_login;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();		
			return res.jsonp(data)
		});	
	});		
});


//excluir Login
app.post('/api/excluirLogin', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update login set deletado = 1 where id_login = '+req.body.id_login;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();		
				return res.jsonp(error);
			}
			connection.release();		
			return res.jsonp(data)
		});
	});	
});

//Upload de foto
app.post('/api/editarImagemPerfil', function (req, res) {	
	AWS.config.loadFromPath('./config.json');
	// Create S3 service object
	s3 = new AWS.S3({apiVersion: '2006-03-01'});
	req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename, mimeType, type, path) {		
		s3.upload({
		Bucket: 'elasticbeanstalk-sa-east-1-001165068693',
		Key: filename,
		Body: file,
		ACL: 'public-read'
		},function (err,resp) {		
		if(err){
			return res.jsonp(err)
		}
		console.log(resp);
		return res.jsonp(resp)
		});
    });	
});

app.post('/api/updateUrlPerfil', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update login set url_perfil = "'+req.body.url+'" where id_login = '+req.body.id_login;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();;		
			return res.jsonp(data)
		});
	});	
});

//SES envio de email
app.post('/api/sendMail', function (req, res) {	
	console.log(req.body.assunto);
	console.log(req.body.destino);
	console.log(req.body.msg);
	var destino = req.body.destino;
	AWS.config.loadFromPath('./configSES.json');
	// Create S3 service object	
	var ses = new AWS.SES({apiVersion: '2010-12-01'});
	// send to list
	var to = [destino ]

	// this must relate to a verified SES account
	var from1 = 'noreply@eusoupratadacasa.com.br'

	// this sends the email
	// @todo - add HTML version
	// this sends the email
// @todo - add HTML version
	ses.sendEmail( { 
	   Source: from1, 
	   Destination: { ToAddresses: to },
	   Message: {
		   Subject: {
			Data: req.body.assunto
			},
		   Body: {
			   Text: {
				   Data: req.body.msg,
			   }
			}
	   }
	}
	, function(err, data) {
		if(err) {
			var error = {};
			error.type = 1;
			error.msg = err;
			return res.jsonp(error);
		}
			console.log('Email sent:');
			return res.jsonp('OK')
	 });
});

//aceite de cliente
app.post('/aceite', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update login set url_perfil = "'+req.body.url+'" where id_login = '+req.body.id_login;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();;		
			return res.jsonp(data)
		});
	});	
});


//relatorios
app.post('/api/getPontosFiltrado', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select p.pontos, p.observacao, p.data_criacao, e.nome as empresaNome, c.nome as campanhaNome, esp.nome as especificadorNome from pontos as p, usuario as u, empresa as e, campanha as c, especificador as esp where p.id_usuario = u.id and e.id = u.id_empresa and p.id_campanha = c.id and p.id_especificador = esp.id';
			
		var filtro = req.body.stringFilter;			
		
		if(filtro != null){
			console.log(string + filtro);
			string = string + filtro;
		}				
		
		connection.query(string, function(err, data) {
		  if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});
	});		
});

app.post('/api/getPontosFiltrado', function(req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select p.pontos, p.observacao, p.data_criacao, e.nome as empresaNome, c.nome as campanhaNome, esp.nome as especificadorNome from pontos as p, usuario as u, empresa as e, campanha as c, especificador as esp where p.id_usuario = u.id and e.id = u.id_empresa and p.id_campanha = c.id and p.id_especificador = esp.id';
			
		var filtro = req.body.stringFilter;			
		
		if(filtro != null){
			console.log(string + filtro);
			string = string + filtro;
		}				
		
		connection.query(string, function(err, data) {
		  if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});
	});		
});


app.post('/api/rankingEspecificadores', function(req, res) {
	pool.getConnection(function(err, connection) {

		var string;
		var id_campanha = req.body.id_campanha;
		if(id_campanha != null){
			string = 'select e.nome, e.empresa, e.profissao, e.cidade, e.uf , (select COALESCE(sum(pontos),0) from pontos where id_especificador = e.id and id_campanha = '+req.body.id_campanha +') as pontos from especificador as e where e.bloqueado = 0 and e.deletado = 0 order by pontos desc';
		}else{
			string = 'select e.nome, e.empresa, e.profissao, e.cidade, e.uf , (select COALESCE(sum(pontos),0) from pontos where id_especificador = e.id) as pontos from especificador as e where e.bloqueado = 0 and e.deletado = 0 order by pontos desc';
		}
		console.log(string);
		connection.query(string, function(err, data) {
		  if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();
			return res.jsonp(data);
		});
	});		
});







app.post('/api/pushNovaPontuacao', function (req, res) {
	pool.getConnection(function(err, connection) {
		console.log(req.body);
		var pontos_recebindos = req.body.pontuacao.valor;
		var pontos_convertidos = pontos_recebindos/100;
		var msg = 'Olá '+req.body.nome+', você recebeu '+pontos_convertidos+' novos pontos. Descrição: '+req.body.pontuacao.descricao ;
		var titulo = 'Nova Pontuação!';
		
		var string = 'INSERT INTO notificacao (data, id_login, msg, titulo, lida, tipo) VALUES (NOW(),"'+req.body.id_login+'","'+msg+'","'+titulo+'" , 0, 1);'
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			var string1 = 'Select * from dispositivos where id_login = '+req.body.id_login;
			console.log(string1);
			connection.query(string1, function(err, disp) {
				if (err){
					var error = {};
					error.type = 1;
					error.msg = err;
					connection.release();
					return res.jsonp(error);
				}
				/*
				if(disp.length>0){
					disp.map(function(token) {			  
						console.log(token.token);
						AWS.config.loadFromPath('./configSNS.json');
						var sns = new AWS.SNS();			
						sns.createPlatformEndpoint({
						  PlatformApplicationArn: 'arn:aws:sns:sa-east-1:001165068693:app/GCM/PrataDaCasa',
						  Token: token.token
						}, function(err, data) {
						  if (err) {
							return res.jsonp(err.stack);
						  }
						  var endpointArn = data.EndpointArn;
						  var payload = {
							"GCM": "{ \"notification\": { \"text\": \"Nova Pontuação!!!\", \"click_action\": \"FCM_PLUGIN_ACTIVITY\" } }"
							}
						
						  // first have to stringify the inner APNS object...
						  payload.APNS = JSON.stringify(payload.APNS);
						  // then have to stringify the entire message payload
						  payload = JSON.stringify(payload);
						  console.log('sending push');
						  sns.publish({
							Message: payload,
							MessageStructure: 'json',
							TargetArn: endpointArn
						  }, function(err, data) {
							if (err) {
							  return res.jsonp(err.stack);
							}		
							console.log("Push feito: token:"+token.token);	
						  });
						});			
					});	
				}
				*/
				connection.release();
				return res.jsonp('Push feito');
			});		
		});	
	});	
});

app.post('/api/pushNovaVisita', function (req, res) {
	pool.getConnection(function(err, connection) {
		console.log(req.body);
		var msg = 'Olá '+req.body.nome+', a empresa '+req.body.nome_empresa+' cadastrou uma nova visita sua.';
		var titulo = 'Nova Visita Cadastrada!';
		
		var string = 'INSERT INTO notificacao (data, id_login, msg, titulo, lida, tipo) VALUES (NOW(),"'+req.body.id_login+'","'+msg+'","'+titulo+'" , 0, 2);'
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			var string1 = 'Select * from dispositivos where id_login = '+req.body.id_login;
			console.log(string1);
			connection.query(string1, function(err, disp) {
				if (err){
					var error = {};
					error.type = 1;
					error.msg = err;
					connection.release();
					return res.jsonp(error);
				}
				/*if(disp.length>0){
					disp.map(function(token) {			  
						console.log(token.token);
						AWS.config.loadFromPath('./configSNS.json');
						var sns = new AWS.SNS();			
						sns.createPlatformEndpoint({
						  PlatformApplicationArn: 'arn:aws:sns:sa-east-1:001165068693:app/GCM/PrataDaCasa',
						  Token: token.token
						}, function(err, data) {
						  if (err) {
							return res.jsonp(err.stack);
						  }
						  var endpointArn = data.EndpointArn;
						  var payload = {
							"GCM": "{ \"notification\": { \"text\": \"Nova Visita Cadastrada!!!\", \"click_action\": \"FCM_PLUGIN_ACTIVITY\" } }"
							}
						
						  // first have to stringify the inner APNS object...
						  payload.APNS = JSON.stringify(payload.APNS);
						  // then have to stringify the entire message payload
						  payload = JSON.stringify(payload);
						  console.log('sending push');
						  sns.publish({
							Message: payload,
							MessageStructure: 'json',
							TargetArn: endpointArn
						  }, function(err, data) {
							if (err) {
							  return res.jsonp(err.stack);
							}		
							console.log("Push feito: token:"+token.token);	
						  });
						});			
					});	
				}*/
				connection.release();
				return res.jsonp('Push feito');
			});								
		});	
	});
});


function insertPushMudancaObra(nome_cliente, nome_empresa, id_login ,connection) {			
	var deffered  = q.defer();	
	var msg = 'Olá '+nome_empresa+', o cliente '+nome_cliente+' teve o status da obra alterado.';
	var titulo = 'Alteração de Status de Obra!';
	
	var string = 'INSERT INTO notificacao (data, id_login, msg, titulo, lida, tipo) VALUES (NOW(),"'+id_login+'","'+msg+'","'+titulo+'" , 0, 3);'
	console.log(string);
	connection.query(string, function(err, data) {
		if (err){
			var error = {};
			error.type = 1;
			error.msg = err;
			//connection.release();
			//return res.jsonp(error);
		}
		deffered.resolve(data);
		//var string1 = 'Select * from dispositivos where id_login = '+id_login;
		//	console.log(string1);
		//	connection.query(string1, function(err, disp) {
		//		if (err){
		//			var error = {};
		//			error.type = 1;
		//			error.msg = err;
					//connection.release();
					//return res.jsonp(error);
		//		}
				
				/*if(disp.length>0){
					disp.map(function(token) {			  
						console.log(token.token);
						AWS.config.loadFromPath('./configSNS.json');
						var sns = new AWS.SNS();			
						sns.createPlatformEndpoint({
						  PlatformApplicationArn: 'arn:aws:sns:sa-east-1:001165068693:app/GCM/PrataDaCasa',
						  Token: token.token
						}, function(err, data) {
						  if (err) {
							return res.jsonp(err.stack);
						  }
						  var endpointArn = data.EndpointArn;
						  var payload = {
							"GCM": "{ \"notification\": { \"text\": \"Alteração de Status de Obra!!!\", \"click_action\": \"FCM_PLUGIN_ACTIVITY\" } }"
							}
						
						  // first have to stringify the inner APNS object...
						  payload.APNS = JSON.stringify(payload.APNS);
						  // then have to stringify the entire message payload
						  payload = JSON.stringify(payload);
						  console.log('sending push');
						  sns.publish({
							Message: payload,
							MessageStructure: 'json',
							TargetArn: endpointArn
						  }, function(err, data) {
							if (err) {
							  return res.jsonp(err.stack);
							}		
							console.log("Push feito: token:"+token.token);	
						  });
						});			
					});	
				}*/
				//connection.release();
				//return res.jsonp('Push feito');
			//});				
	});
	return deffered.promise;	
}

app.post('/api/pushMudancaStatusObra', function (req, res) {
	pool.getConnection(function(err, connection) {
		console.log(req.body);		
		var string = 'SELECT e.*,l.id_login, (select count(*) from clientes as c where c.empresa = e.id) as qtdIndicacoes , (select count(*) from presenca_x_empresa as pe where pe.id_empresa = e.id) as qtdPresenca, (select COALESCE(sum(pontos),0) from pontos as p, usuario as u, campanha as c where p.id_usuario =  u.id and u.id_login = l.id_login and p.id_campanha = (select id from campanha where data_fim>NOW() and deletado = 0)) as pontosEmpresa from empresa as e, usuario as u, login as l where e.deletado=0 and e.nome not like "admin" and e.id = u.id_empresa and u.id_login = l.id_login and l.deletado = 0'
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			var promises = [];	
			data.map(function(emp) {			  
				 promises.push(insertPushMudancaObra(req.body.nome_cliente, emp.nome, emp.id_login,  connection));	
			});
			
			q.all(promises).then(function () {
				connection.release();
				return res.jsonp('ok');
			});
		});	
	});	
});

app.post('/api/getAllNotifications', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select * from notificacao where id_login = '+req.body.id_login+' and excluido = 0 order by data desc';
		//var string = 'select * from notificacao where excluido = 0 order by data desc';
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();;		
			return res.jsonp(data)
		});
	});	
});

app.post('/api/setReadNotification', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update notificacao set lida = 1 where id = '+req.body.notificacao.id;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();;		
			return res.jsonp(data)
		});
	});	
});

app.post('/api/getAllUnreadNotifications', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select count(*) as qtd from notificacao where lida = 0 and excluido = 0 and id_login = '+req.body.id_login;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();;		
			return res.jsonp(data)
		});
	});	
});

app.post('/api/excluirNotificacao', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'update notificacao set excluido = 1 where id =' +req.body.id_notificacao;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			connection.release();;		
			return res.jsonp(data)
		});
	});	
});

app.post('/api/checkNewDispositivo', function (req, res) {
	pool.getConnection(function(err, connection) {
		var string = 'select * from dispositivos where token =  "'+req.body.token+'" and id_login = '+req.body.id_login;
		console.log(string);
		connection.query(string, function(err, data) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;
				connection.release();
				return res.jsonp(error);
			}
			if(data.length==0){
				var string1 = 'insert into dispositivos(data, id_login, token) values (now(), '+req.body.id_login+' , "'+req.body.token + '")';
				console.log(string1);
				connection.query(string1, function(err1, data) {
					if (err1){
						var error = {};
						error.type = 1;
						error.msg = err;
						connection.release();
						return res.jsonp(error);
					}					
				});				
			}					
			connection.release();;		
			return res.jsonp(data)
		});
	});	
});

//Serviço de push
var aniversarioEspecificador = new CronJob({
  cronTime: '00 00 10 * * 0-6',
  onTick: function() {
    pool.getConnection(function(err, connection) {
		var string = "SELECT * ,DATE_ADD(data_nascimento, INTERVAL IF(DAYOFYEAR(data_nascimento) >= DAYOFYEAR(CURDATE()), YEAR(CURDATE())-YEAR(data_nascimento),YEAR(CURDATE())-YEAR(data_nascimento)+1) YEAR) AS `next_birthday` FROM `especificador` WHERE `data_nascimento` IS NOT NULL HAVING `next_birthday` BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 0 DAY) ORDER BY `next_birthday` LIMIT 1000;"
		connection.query(string, function(err, aniversarios) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;				
				console.log(error);
			}
			if(aniversarios.length>0){
				aniversarios.map(function(aniversario) {					
					var msg = 'Parabéns '+aniversario.nome+', muita saúde e sucesso em sua vida. A equipe Prata da Casa te parabeniza.';
					var titulo = 'Feliz Aniversário!';					
					var string = 'INSERT INTO notificacao (data, id_login, msg, titulo, lida, tipo) VALUES (NOW(),"'+aniversario.id_login+'","'+msg+'","'+titulo+'" , 0, 4);'
					console.log(string);					
					connection.query(string, function(err, data) {					
						var string = "SELECT * from dispositivos where id_login = "+aniversario.id_login;
						console.log(string)
						connection.query(string, function(err, dispositivos) {
							if (err){						
								var error = {};
								error.type = 1;
								error.msg = err;							
								console.log(error);
							}							
							if(dispositivos.length>0){
								dispositivos.map(function(dispositivo) {
									AWS.config.loadFromPath('./configSNS.json');
									var sns = new AWS.SNS();

									sns.createPlatformEndpoint({
									  PlatformApplicationArn: 'arn:aws:sns:sa-east-1:001165068693:app/GCM/PrataDaCasa',
									  Token: dispositivo.token
									}, function(err, data) {
									  if (err) {
										console.log(err.stack);
										return;
									  }
									  var endpointArn = data.EndpointArn;
									  var payload = {
										"GCM": "{ \"notification\": { \"text\": \"Feliz Aniversário\" } }"
										}

									  // first have to stringify the inner APNS object...
									  payload.APNS = JSON.stringify(payload.APNS);
									  // then have to stringify the entire message payload
									  payload = JSON.stringify(payload);

									  console.log('sending push');
									  sns.publish({
										Message: payload,
										MessageStructure: 'json',
										TargetArn: endpointArn
									  }, function(err, data) {
										if (err) {
										  console.log(err.stack);
										  return;
										}
										console.log('Push feito');	
									  });
									});								
								});	
							}						
						});
					});
				});	
			}
			connection.release();			
		});
	});		
	/*
     * Runs every weekday (Monday through Friday)
     * at 11:30:00 AM. It does not run on Saturday
     * or Sunday.
     */
  },
  start: false,
  timeZone: 'America/Sao_Paulo'
});

//Serviço de push
var aniversarioCliente = new CronJob({
  cronTime: '00 10 10 * * 0-6',
  onTick: function() {
    pool.getConnection(function(err, connection) {
		var string = "SELECT * ,DATE_ADD(data_nascimento, INTERVAL IF(DAYOFYEAR(data_nascimento) >= DAYOFYEAR(CURDATE()), YEAR(CURDATE())-YEAR(data_nascimento),YEAR(CURDATE())-YEAR(data_nascimento)+1) YEAR) AS `next_birthday` FROM `clientes` WHERE `data_nascimento` IS NOT NULL HAVING `next_birthday` BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 0 DAY) ORDER BY `next_birthday` LIMIT 1000;"
		console.log(string);
		connection.query(string, function(err, aniversarios) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;				
				console.log(error);
			}
			if(aniversarios.length>0){
				aniversarios.map(function(aniversario) {					
					var msg = 'Parabéns '+aniversario.nome+', muita saúde e sucesso em sua vida. A equipe Prata da Casa te parabeniza.';
					var titulo = 'Feliz Aniversário!';					
					var string = 'INSERT INTO notificacao (data, id_login, msg, titulo, lida, tipo) VALUES (NOW(),"'+aniversario.id_login+'","'+msg+'","'+titulo+'" , 0, 4);'
					console.log(string);					
					connection.query(string, function(err, data) {					
						var string = "SELECT * from dispositivos where id_login = "+aniversario.id_login;
						console.log(string)
						connection.query(string, function(err, dispositivos) {
							if (err){						
								var error = {};
								error.type = 1;
								error.msg = err;							
								console.log(error);
							}							
							if(dispositivos.length>0){
								dispositivos.map(function(dispositivo) {
									AWS.config.loadFromPath('./configSNS.json');
									var sns = new AWS.SNS();

									sns.createPlatformEndpoint({
									  PlatformApplicationArn: 'arn:aws:sns:sa-east-1:001165068693:app/GCM/PrataDaCasa',
									  Token: dispositivo.token
									}, function(err, data) {
									  if (err) {
										console.log(err.stack);
										return;
									  }
									  var endpointArn = data.EndpointArn;
									  var payload = {
										"GCM": "{ \"notification\": { \"text\": \"Feliz Aniversário\" } }"
										}

									  // first have to stringify the inner APNS object...
									  payload.APNS = JSON.stringify(payload.APNS);
									  // then have to stringify the entire message payload
									  payload = JSON.stringify(payload);

									  console.log('sending push');
									  sns.publish({
										Message: payload,
										MessageStructure: 'json',
										TargetArn: endpointArn
									  }, function(err, data) {
										if (err) {
										  console.log(err.stack);
										  return;
										}
										console.log('Push feito');	
									  });
									});								
								});	
							}						
						});
					});
				});	
			}
			connection.release();			
		});
	});		
	/*
     * Runs every weekday (Monday through Friday)
     * at 11:30:00 AM. It does not run on Saturday
     * or Sunday.
     */
  },
  start: false,
  timeZone: 'America/Sao_Paulo'
});

//Serviço de push
var premioEspecificador = new CronJob({
  cronTime: '00 00 09 * * 1-1',
  onTick: function() {
    pool.getConnection(function(err, connection) {
		var string = "select e.*, e.id, (select COALESCE(sum(pontos),0) from pontos where id_especificador = e.id and id_campanha = (SELECT id from campanha where data_fim>NOW() and deletado = 0)) as pontos  from especificador as e where e.deletado=0"
		console.log(string);
		connection.query(string, function(err, especificadores) {
			if (err){
				var error = {};
				error.type = 1;
				error.msg = err;				
				console.log(error);
			}
			especificadores.map(function(especificador) {
				if(especificador.pontos>0){
					console.log(especificador.pontos);
					var string1 = "select * from premio where id_campanha =  (SELECT id from campanha where data_fim>NOW() and deletado = 0)"
					console.log(string1);
					connection.query(string1, function(err, premios) {
						if (err){
							var error = {};
							error.type = 1;
							error.msg = err;				
							console.log(error);
						}
						premios.map(function(premio) {
							if(premio.pontos - especificador.pontos >= 500){
								console.log(especificador.pontos);	
								var msg = 'Olá '+especificador.nome+', com menos de 500 pontos você consegue trocar seus pontos por: '+premio.nome;
								var titulo = 'Prêmio Próximo!';					
								var string = 'INSERT INTO notificacao (data, id_login, msg, titulo, lida, tipo) VALUES (NOW(),"'+especificador.id_login+'","'+msg+'","'+titulo+'" , 0, 5);'
								console.log(string);					
								connection.query(string, function(err, data) {					
									var string = "SELECT * from dispositivos where id_login = "+especificador.id_login;
									console.log(string)
									connection.query(string, function(err, dispositivos) {
										if (err){						
											var error = {};
											error.type = 1;
											error.msg = err;							
											console.log(error);
										}							
										if(dispositivos.length>0){
											dispositivos.map(function(dispositivo) {
												AWS.config.loadFromPath('./configSNS.json');
												var sns = new AWS.SNS();

												sns.createPlatformEndpoint({
												  PlatformApplicationArn: 'arn:aws:sns:sa-east-1:001165068693:app/GCM/PrataDaCasa',
												  Token: dispositivo.token
												}, function(err, data) {
												  if (err) {
													console.log(err.stack);
													return;
												  }
												  var endpointArn = data.EndpointArn;
												  var payload = {
													"GCM": "{ \"notification\": { \"text\": \"Prêmio Próximo\" } }"
													}

												  // first have to stringify the inner APNS object...
												  payload.APNS = JSON.stringify(payload.APNS);
												  // then have to stringify the entire message payload
												  payload = JSON.stringify(payload);

												  console.log('sending push');
												  sns.publish({
													Message: payload,
													MessageStructure: 'json',
													TargetArn: endpointArn
												  }, function(err, data) {
													if (err) {
													  console.log(err.stack);
													  return;
													}
													console.log('Push feito');	
												  });
												});								
											});	
										}						
									});
								});	
							}				
						});					
					});
				}				
			});				
			connection.release();			
		});
	});		
	/*
     * Runs every weekday (Monday through Friday)
     * at 11:30:00 AM. It does not run on Saturday
     * or Sunday.
     */
  },
  start: false,
  timeZone: 'America/Sao_Paulo'
});


//aniversarioEspecificador.start();
//aniversarioCliente.start();
//premioEspecificador.start();


//configuracao para aws
var port = 9002;
app.listen(port);

//configuracao para o heroku
//app.listen(process.env.PORT || 5000)

console.log('Listening');