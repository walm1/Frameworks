'use strict'

var validator = require('validator');
var fs = require('fs')
var path = require('path')
var Article = require('../models/Article');
const { exists } = require('../models/Article');

var controller = {

    

    data: (req, res) =>{
        var hola = req.body.hola;
        
        return res.status(200).send({
            nombre: "walter",
            apellido: "martinez",
            hola
            
        })
    },

    test: (req,res)=>{
        return res.status(200).send({
            message: "messi el mejor"
        })
    },
    
    save: (req,res)=>{
        var params = req.body;
        
        try{
             var validateTitle = !validator.isEmpty(params.title)
             var validateContent = !validator.isEmpty(params.content)
        } catch(err){
            return res.status(200).send({
                status: 'error',
             message: 'faltan datos por enviar'
        })
        }
        if(validateTitle && validateContent){

            var article = new Article();
            article.title = params.title;
            article.content = params.content;
            article.image = null;

            article.save((err, articleStored)=>{
                if(err || !articleStored){
                    return res.status(404).send({
                        status: 'error',
                        message: "el articulo no se ha guardado"
                
                })

            }
                 return res.status(200).send({
                status: 'succes',
                article: articleStored
                 });
                
        });  
            

        } else{
        return res.status(200).send({
            status: 'error',
            message: "los datos no son validos"
        })
    }
    
    },
    getArticles: (req, res)=> {
        var query = Article.find({})

        var last = req.params.last; 
        if(last || last !=undefined){
            query.limit(5)
        }

        query.sort('-_id').exec((err, articles)=>{

            if(err){
                return res.status(500).send({
                    status: 'err',
                    message: 'error al devolver los articulos'
                })
            }

            else if(!articles){
                return res.status(404).send({
                    status: 'error',
                    message: 'no hay articulos para mostrar'
                })
            }
            
            return res.status(200).send({
                status: 'succes',
                articles
        });
        
        });
    },
    getArticle: (req, res)=>{
        var articleId = req.params.id;

        if(!articleId || articleId == null){
            return res.status(404).send({
                status: 'error',
                message: 'no existe el articulo'
            })
        }

        Article.findById(articleId, (err, article)=>{
            if(err || !article){
                return res.status(404).send({
                    status: 'error',
                    message: 'no existe el articulo'
                })
            }

            return res.status(200).send({
                status: 'succes',
                article
            })

        })

      
    },

    update: (req, res) => {
        // Recoger el id del articulo por la url
        var articleId = req.params.id;

        // Recoger los datos que llegan por put
        var params = req.body;

        // Validar datos
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar !!!'
            }); 
        }

        if(validate_title && validate_content){
             // Find and update
             Article.findOneAndUpdate({_id: articleId}, params, {new:true}, (err, articleUpdated) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar !!!'
                    });
                }

                if(!articleUpdated){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el articulo !!!'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                });
             });
        }else{
             // Devolver respuesta
            return res.status(200).send({
                status: 'error',
                message: 'La validación no es correcta !!!'
            });
        }
       
    },
    delete: (req, res )=>{

        var articleId = req.params.id;

        Article.findOneAndDelete({_id: articleId}, (err, articleRemoved)=>{
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'error al borrar'
                });
            } else if(!articleRemoved){
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado el articulo, posiblemente no exista'
                });
            }

            return res.status(200).send({
                status: 'success',
                article: articleRemoved
            })
        });

        
    },
    upload: (req, res)=>{

        var filename = 'imagen no subida';

        if(!req.files){
            return res.status(404).send({
                status: 'error',
                message: filename
            })
        }

        var filepath = req.files.file0.path;
        var filesplit = filepath.split('\\')

        var filename = filesplit[2]

        var extensionsplit = filename.split('\.');
        var fileExt = extensionsplit[1]

        // console.log(req.files)

        if(fileExt != 'png' && fileExt != 'jpg' && fileExt != 'jpeg' && fileExt != 'gif' ){
            fs.unlink(filepath, (err)=>{
                return res.status(200).send({
                    status: 'error',
                    message: 'la extension de la imagen no es valida'
                });
            })
        }else{

            var articleId = req.params.id

            Article.findOneAndUpdate({_id: articleId}, {image: filename}, {new: true}, (err, articleUpdated)=>{

                if(err || !articleUpdated){
                    return res.status(500).send({
                        status: 'error',
                        message: 'error al guardar la imagen del articulo'
                    })
                }

                return res.status(200).send({
                    status: 'success',
                    articleUpdated
                })
            })

            
        }

    },
    getImage: (req, res)=>{

        var file = req.params.image;
        var pathFile = './upload/articles/'+file
        
        fs.stat(pathFile, (stat)=>{
            console.log(stat)
            if(exists){
                return res.sendFile(path.resolve(pathFile))
            }else{
                return res.status(404).send({
                    status: 'error',
                    message: 'la imagen no existe'
                });
            
            }
        })
    },
    search: (req, res)=>{
        var searchString = req.params.search

        Article.find({ "$or":[
            {"title": {"$regex": searchString, "$options": "i" }},
            {"content": {"$regex": searchString, "$options": "i" }}
        ]}).sort([['date', 'descending']])
        .exec((err, articles)=>{

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message:'error en la peticion'
                })
            }
            else if(!articles || articles.length <= 0){
                return res.status(404).send({
                    status: 'error',
                    message:'no hay articulos que coincidan con tu busqueda'
                })
            }


            return res.status(200).send({
                status: 'succes',
                articles
            });
        })

        
    },
};


module.exports = controller
