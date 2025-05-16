export const supportedLanguages = {
    codes: ['de', 'en', 'es', 'fr', 'pt'],
    names: ['German', 'English', 'Spanish', 'French', 'Portuguese']
}

interface LanguageStrings {
    [key:string]: {
        [key: string]: string
    }
}



export const languageText = (id:string, fallbackText:string = '???') => {
    let lang = navigator.language.split('-')[0]

    // If language is not in supported list, fall back to English

    if (!supportedLanguages.codes.includes(lang)) lang='en'

    try { return strings[id][lang] }
    catch {
        try { return strings[id]['en'] }
        catch { return fallbackText }
    }

}


const strings: LanguageStrings= {
    ABOUT: {
        de: 'Über',
        en: 'About',
        es: 'Sobre',
        fr: 'À Propos', 
        pt: 'Sobre',
    },

    ABOUT_TESSERACT: {
        de: 'Über Tesseract',
        en: 'About Tesseract',
        es: 'Sobre Tesseract',
        fr: 'À Propos de Tesseract', 
        pt: 'Sobre Tesseract',
    },

    BANNED: {
        de: 'Verboten',
        en: 'Banned',
        es: 'Prohibido'
    },

    COMMUNITY_LIST_ONLY_MODERATING_TITLE: {
        de: "Nur Moderieren",
        en: "Only Moderating",
        es: "Solo Moderando",
        fr: "Modération Uniquement",
        pt: "Apenas Moderando"
    },

    COMMUNITY_LIST_ONLY_MODERATING_DESC: {
        de: "Nur von mir moderierte Communities anzeigen.",
        en: "Show only communities I moderate.",
        es: "Mostrar solo las comunidades que modero.",
        fr: "Afficher uniquement les communautés que je modère.",
        pt: "Mostrar apenas comunidades que eu modero.",
    },

    EXPLORE_COMMUNITIES: {
        de: 'Communities Erkunden',
        en: 'Explore Communities',
        es: 'Explorar Comunidades',
        fr: 'Explorer les Communautés',
        pt: 'Explorar Comunidades'
    },

    FAVORITES: {
        de: 'Favoriten',
        en: 'Favorites',
        es: 'Favoritos',
        fr: 'Favoris',
        pt: 'Favoritos'
    },

    FILTER_COMMUNITIES: {
        de: 'Filtern Communities',
        en: 'Filter Communities',
        es: 'Filtrar Comunidades',
        fr: 'Filtrer les Communautés',
        pt: 'Filtrar Comunidades'
    },

    GROUPS: {
        de: 'Gruppen',
        en: 'Groups',
        es: 'Grupos',
        fr: 'Groupes',
        pt: 'Grupos'
    },

    HOME: {
        de: 'Heim',
        en: 'Home',
        es: 'Inicio',
        fr: 'Maison',
        pt: 'Lar',
    },

    HOT: {
        de: 'Heiß',
        en: 'Hot',
        es: 'Caliente',
        fr: 'Chaud',
        pt: 'Quente'
    },

    INBOX: {
        de: 'Posteingang',
        en: 'Inbox',
        es: 'Bandeja de Entrada',
        fr: 'Boîte de Réception',
        pt: 'Caixa de Entrada'
    },


    NO_GROUPS_TITLE: {
        de: "Keine Gruppen",
        en: "No Groups",
        es: "No Grupos",
        fr: "Aucun Groupe",
        pt: "Nenhum Grupo"
    },

    NO_GROUPS_DESC: {
        de: "Ihre gruppierten Communities werden hier angezeigt.",
        en: "Your grouped communities will appear here.",
        es: "Tus comunidades agrupadas aparecerán aquí.",
        fr: "Vos communautés groupées apparaîtront ici.",
        pt: "Suas comunidades agrupadas aparecerão aqui."
    },

    NO_SUBSCRIPTIONS_TITLE: {
        de: 'Keine Abonnements',
        en: 'No Subscriptions',
        es: 'Sin Suscripciones',
        fr: "Pas d'abonnements",
        pt: 'No subscrições'
    },

    NO_SUBSCRIPTIONS_DESC: {
        de: "Sie sind bei keiner Community angemeldet. Falls doch, werden diese hier angezeigt.",
        en: "You are not subscribed to any communities. When you are, they will be listed here.",
        es: "No estás suscrito a ninguna comunidad. Cuando lo estés, aparecerán aquí.",
        fr: "Vous n'êtes abonné à aucune communauté. Si vous le faites, elles apparaîtront ici.",
        pt: "Você não está inscrito em nenhuma comunidade. Quando estiver, elas aparecerão aqui."
    },

    POPULAR: {
        de: 'Beliebt',
        en: 'Popular',
        es: 'Popular',
        fr: 'Populaire',
        pt: 'Popular'
    },

    PROFILE: {
        de: 'Profil',
        en: 'Profile',
        es: 'Perfil',
        fr: 'Profil',
        pt: 'Perfil'
    },

    REFRESH: {
        de: "Aktualisieren",
        en: "Refresh",
        es: "Actualizar",
        fr: "Mise à Jour",
        pt: "Atualizar"
    },

    RESET: {
        de: 'Zurücksetzen',
        en: 'Reset',
        es: 'Reiniciar',
        fr: 'Réinitialiser',
        pt: 'Reiniciar'
    },

    SAVED_ITEMS: {
        de: 'Gespeicherte Artikel',
        en: 'Saved Items',
        es: 'Elementos Guardados',
        fr: 'Éléments Enregistrés',
        pt: 'Itens Salvos'
    },

    SETTINGS: {
        de: 'Einstellungen',
        en: 'Settings',
        es: 'Ajustes',
        fr: 'Paramètres',
        pt: 'Configurações'
    },

    SUBSCRIBED: {
        de: 'Gezeichnet',
        en: 'Subscribed',
        es: 'Suscrito',
        fr: 'Abonné',
        pt: 'Inscrito'
    },

    TOP_DAY: {
        de: 'Top Tag',
        en: 'Top Day',
        es: 'Día Superior',
        fr: 'Jour de Gloire',
        pt: 'Dia de Topo'
    }
    

}