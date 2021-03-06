var connection = require('./connection');
var index = require("./index");

const tables = {
    medicaments : {nom : "Medicaments", attr : ['cip13', 'nom', 'formePharma']},
    patients : {nom : "Patients", attr : ['email', 'password', 'prenom', 'nom', 'date_naissance', 'id_aide_soignant']},
    aideSoignants : {nom : "Aide_Soignants", attr : ['email', 'password', 'prenom', 'nom', 'date_naissance', 'adresse']},
    traitements : {nom : "Traitements", attr : ['id_patient', 'id_aide_soignant', 'nom', 'date_debut', 'duree_traitement', 'matin', 'apres_midi', 'soir']},
    traitementsMedicament : {nom : "Traitements_Medicament", attr : ['id_traitement', 'id_medicament', 'dosage', 'date_peremption']},
    rendezVous : {nom : "Rendez_Vous", attr : ['id_patient', 'id_aide_soignant', 'date_rdv']},
    medicamentCategorie : {nom : "Medicament_Categorie", attr : ['categorie']},
    firebaseTokens : {nom : "Firebase_Tokens", attr : ['id_patient', 'token']}
};
exports.tables = tables;


const createTables = [
        'CREATE TABLE IF NOT EXISTS ' + tables.medicamentCategorie.nom + '('
        + tables.medicamentCategorie.attr[0] + ' VARCHAR(64) PRIMARY KEY'
        + ')',

        'CREATE TABLE IF NOT EXISTS ' + tables.medicaments.nom + '('
        + 'id INT AUTO_INCREMENT PRIMARY KEY,'
        + tables.medicaments.attr[0] + ' VARCHAR(13) NOT NULL,'
        + tables.medicaments.attr[1] + ' VARCHAR(256) NOT NULL,'
        + tables.medicaments.attr[2] + ' VARCHAR(64) NOT NULL,'
        + 'FOREIGN KEY(' + tables.medicaments.attr[2] + ') REFERENCES ' + tables.medicamentCategorie.nom + '(' + tables.medicamentCategorie.attr[0] + '),'
        + 'CONSTRAINT UniqueCIP UNIQUE(' + tables.medicaments.attr[0] +')'
        + ')',

        'CREATE TABLE IF NOT EXISTS ' + tables.aideSoignants.nom + '('
        + 'id INT AUTO_INCREMENT PRIMARY KEY,'
        + tables.aideSoignants.attr[0] + ' VARCHAR(64) NOT NULL,'
        + tables.aideSoignants.attr[1] + ' VARCHAR(255) NOT NULL,'
        + tables.aideSoignants.attr[2] + ' VARCHAR(32) NOT NULL,'
        + tables.aideSoignants.attr[3] + ' VARCHAR(32) NOT NULL,'
        + tables.aideSoignants.attr[4] + ' DATE NOT NULL,'
        + tables.aideSoignants.attr[5] + ' VARCHAR(255) NOT NULL,'
        + ' CONSTRAINT UniqueEmail UNIQUE(' + tables.aideSoignants.attr[0] +')'
        + ')',

        'CREATE TABLE IF NOT EXISTS ' + tables.patients.nom + '('
        + 'id INT AUTO_INCREMENT PRIMARY KEY,'
        + tables.patients.attr[0] + ' VARCHAR(64) NOT NULL,'
        + tables.patients.attr[1] + ' VARCHAR(255) NOT NULL,'
        + tables.patients.attr[2] + ' VARCHAR(32) NOT NULL,'
        + tables.patients.attr[3] + ' VARCHAR(32) NOT NULL,'
        + tables.patients.attr[4] + ' DATE NOT NULL,'
        + tables.patients.attr[5] + ' INT NOT NULL,'
        + 'FOREIGN KEY(' + tables.patients.attr[5] + ') REFERENCES ' + tables.aideSoignants.nom + '(id),'
        + ' CONSTRAINT UniqueEmail UNIQUE(' + tables.patients.attr[0] +')'
        + ')',

        'CREATE TABLE IF NOT EXISTS ' + tables.traitements.nom + '('
        + 'id INT AUTO_INCREMENT PRIMARY KEY,'
        + tables.traitements.attr[0] + ' INT NOT NULL,'
        + tables.traitements.attr[1] + ' INT NOT NULL,'
        + tables.traitements.attr[2] + ' VARCHAR(64) NOT NULL,'
        + tables.traitements.attr[3] + ' DATE NOT NULL,'
        + tables.traitements.attr[4] + ' INT NOT NULL,'
        + tables.traitements.attr[5] + ' BOOLEAN NOT NULL,'
        + tables.traitements.attr[6] + ' BOOLEAN NOT NULL,'
        + tables.traitements.attr[7] + ' BOOLEAN NOT NULL,'
        + 'FOREIGN KEY(' + tables.traitements.attr[0] + ') REFERENCES ' + tables.patients.nom + '(id) ON DELETE CASCADE,'
        + 'FOREIGN KEY(' + tables.traitements.attr[1] + ') REFERENCES ' + tables.aideSoignants.nom + '(id) ON DELETE CASCADE'
        + ')',

        'CREATE TABLE IF NOT EXISTS ' + tables.traitementsMedicament.nom + '('
        + 'id INT AUTO_INCREMENT PRIMARY KEY,'
        + tables.traitementsMedicament.attr[0] + ' INT NOT NULL,'
        + tables.traitementsMedicament.attr[1] + ' INT NOT NULL,'
        + tables.traitementsMedicament.attr[2] + ' VARCHAR(127) NOT NULL,'
        + tables.traitementsMedicament.attr[3] + ' DATE NOT NULL,'
        + 'FOREIGN KEY(' + tables.traitementsMedicament.attr[0] + ') REFERENCES ' + tables.traitements.nom + '(id) ON DELETE CASCADE,'
        + 'FOREIGN KEY(' + tables.traitementsMedicament.attr[1] + ') REFERENCES ' + tables.medicaments.nom + '(id) ON DELETE CASCADE'
        + ')',

        'CREATE TABLE IF NOT EXISTS ' + tables.rendezVous.nom + '('
        + 'id INT AUTO_INCREMENT PRIMARY KEY,'
        + tables.rendezVous.attr[0] + ' INT NOT NULL,'
        + tables.rendezVous.attr[1] + ' INT NOT NULL,'
        + tables.rendezVous.attr[2] + ' VARCHAR(32) NOT NULL,'
        + 'FOREIGN KEY(' + tables.rendezVous.attr[0] + ') REFERENCES ' + tables.patients.nom + '(id),'
        + 'FOREIGN KEY(' + tables.rendezVous.attr[1] + ') REFERENCES ' + tables.aideSoignants.nom + '(id) ON DELETE CASCADE'
        + ')',

        'CREATE TABLE IF NOT EXISTS ' + tables.firebaseTokens.nom + '('
        + 'id INT AUTO_INCREMENT PRIMARY KEY,'
        + tables.firebaseTokens.attr[0] + ' INT NOT NULL,'
        + tables.firebaseTokens.attr[1] + ' VARCHAR(255) NOT NULL,'
        + ' CONSTRAINT UniqueEmail UNIQUE(' + tables.firebaseTokens.attr[0] +'),'
        + 'FOREIGN KEY(' + tables.firebaseTokens.attr[0] + ') REFERENCES ' + tables.patients.nom + '(id) ON DELETE CASCADE'
        + ')'
];

function notifyCreatedTable(result, table){
	if(result['warningCount'] == 0) console.log('Table ' + table + ' crée');
	else if(result['warningCount'] == 1) console.log('Table ' + table + ' existe');
	else console.log('Unknown table warning');
}

function createAllTables(){
    return new Promise(function(resolve, reject) {
        for(var i=0; i<createTables.length; i++){
            connection.query(createTables[i], function(err, result){
                if(err){
                    reject(err);
                }
                //notifyCreatedTable(result, medicamentsTable);
            });
        }
        resolve();
    });
}

exports.createAllTables = createAllTables;

function fillMedicamentCategorieTable(){
    return new Promise(function(resolve, reject) {
        var formePharmas = index.formePharmas;
        for(var i=0; i<formePharmas.length; i++){
            var sql = "INSERT INTO " + tables.medicamentCategorie.nom + '(' + tables.medicamentCategorie.attr[0] + ') VALUES (?);';
            connection.query(sql, [formePharmas[i]], function(err, response){
                if(err){
                    reject(err);
                }
            });
        }
        resolve();
    });
}

exports.fillMedicamentCategorieTable = fillMedicamentCategorieTable;