const Privileges = {
    groups: {
      "Redacteur": [1,99],
      "Punchline maker": [100,199],
      "Assistant de la communauté": [200,299],
      "Gestionnaire du site": [300,399],
      "Super utilisateur": [400,499]
    },
    privileges: {
        0: "Modifier ses informations personnelles",
        1: "Écrire et modifier article",
        2: "Participer à d'autre rédaction",
        3: "Supprimer ses articles",
        4: "Ajouter des catégories pour la rédaction",
        5: "Modifier ses catégories pour la rédaction",
        6: "Modifier les catégories définies par d'autres",
        100: "Créer des cartes de punchline",
        101: "Modifier les cartes de punchline créées par soi",
        102: "Modifier les cartes de punchlines d'autri",
        103: "Supprimer ses cartes de punchlines",
        104: "Ajouter des catégories de punchline",
        105: "Modifier ses catégories de punchline",
        106: "Modifier les catégories de punchline définies par d'autres",
        200: "Lire les messages de contact",
        201: "Répondre aux messages",
        202: "Supprimer les messages",
        203: "Supprimer ses réponses",
        300: "Définir les articles du billboard",
        301: "Définir la configuration par défaut des punchlines",
        302: "Définir les visibilités pour les publications",
        303: "Définir le texte de présentation du site",
        400: "Intégrer de nouveaux membres",
        401: "Modifier les mots de passe des utilisateurs",
        402: "Modifier les informations personnelles des utilisateurs",
        403: "Supprimer les catégories de punchline",
        404: "Supprimer les catégories de punchline",
        405: "Accès aux rapports",
        406: "Assigner les community manager aux filiales",
        407: "Assigner les privilèges aux utilisateurs",
        408: "Activer/Désactiver un utilisateur",
        409: "Gestion des filiales"
    },
    summary: {}
}

for(let i in Privileges.privileges){
    for(let j in Privileges.groups){
        if(
            i >= Privileges.groups[j][0] &&
            i <= Privileges.groups[j][1]
        ){
            if(!(j in Privileges.summary)){
                Privileges.summary[j] = 0;
            }
            Privileges.summary[j]++;
        }
    }
}
module.exports = Privileges;