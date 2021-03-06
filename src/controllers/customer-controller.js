'use strict'
const ValidationContract = require('../validators/fluid-validator')
const repository = require('../repositories/customer-repository')
const md5 = require('md5');
const authService = require("../services/auth-service")
 

const emailService = require('../services/email-service')
//CHAVE SENDGRID: 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

exports.post = async (req, res, next) => {
    let contract = new ValidationContract();
    contract.hasMinLen(req.body.name, 3, 'O nome deve conter no minimo 3 caracteres')
    contract.isEmail(req.body.email, 'Email inválido')
    contract.hasMinLen(req.body.password, 6, 'A senha deve conter no minimo 6 caracteres')

    //Se os dados forem inválidos
    if (!contract.isValid()) {
        res.status(400).send(contract.errors()).end();
        return;
    }
    try {
        await repository.create({
            name: req.body.name,
            email: req.body.email,
            password: md5(req.body.password + global.SALT_KEY)
        });
        emailService.send(req.body.email, 'Bem Vindo ao Node Store', global.EMAIL_TMPL.replace('{0}', req.body.name))
        res.status(201).send({ message: 'Cliente cadastrado com sucesso!' });
    } catch (e) {
        res.status(500).send({
            message: "Falha ao processar a requisição"
        })
    }

};

exports.authenticate = async (req, res, next) => {
    try {
        const customer = await repository.authenticate({
            email: req.body.email,
            password: md5(req.body.password + global.SALT_KEY)
        });
        if (!customer) {
            res.status(404).send({ message: "Usuario ou senha invalidos." });
            return
        }

        const token = await authService.generateToken({
            id: customer.id,
            email: customer.email,
            name: customer.name
        });

        res.status(201).send({
            token: token,
            data: {
                email: customer.email,
                name: customer.name
            }
        });
    } catch (e) {
        res.status(500).send({
            message: "Falha ao processar a requisição"
        })
    }

};