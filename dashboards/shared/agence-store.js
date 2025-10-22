// Store commun pour les agences
class AgenceStore {
    constructor() {
        this.loadAgences();
    }

    loadAgences() {
        const savedAgences = localStorage.getItem('agences');
        this.agences = savedAgences ? JSON.parse(savedAgences) : [];
        return this.agences;
    }

    saveAgences() {
        localStorage.setItem('agences', JSON.stringify(this.agences));
        // Émettre un événement pour notifier les autres composants
        document.dispatchEvent(new CustomEvent('agencesUpdated', { 
            detail: { agences: this.agences }
        }));
        console.log('Agences sauvegardées et événement émis');
    }

    addAgence(agenceData) {
        console.log('🔵 addAgence appelé avec:', agenceData);
        
        // Validation stricte du nom
        if (!agenceData.nom || agenceData.nom.trim() === '') {
            console.error('❌ Nom de l\'agence manquant');
            throw new Error('Le nom de l\'agence est requis');
        }

        // Validation de la wilaya
        if (!agenceData.wilaya || agenceData.wilaya.trim() === '') {
            console.error('❌ Wilaya manquante');
            throw new Error('La wilaya est requise');
        }

        // Validation de l'email et du mot de passe
        if (!agenceData.email || agenceData.email.trim() === '') {
            console.error('❌ Email manquant');
            throw new Error('L\'email est requis');
        }

        if (!agenceData.password || agenceData.password.trim() === '') {
            console.error('❌ Mot de passe manquant');
            throw new Error('Le mot de passe est requis');
        }

        // Envoyer au backend
        return this.sendToBackend(agenceData);
    }

    async sendToBackend(agenceData) {
        // ✅ Récupérer le token admin depuis sessionStorage (nouveau système AuthService)
        let token = sessionStorage.getItem('auth_token');
        
        // Fallback sur localStorage pour compatibilité
        if (!token) {
            token = localStorage.getItem('admin_token');
        }
        
        console.log('🔑 Token admin trouvé:', token ? 'Oui ✅' : 'Non ❌');
        
        if (!token) {
            alert('⚠️ Session expirée. Veuillez vous reconnecter en tant qu\'admin.');
            window.location.href = '/login.html?role=admin';
            throw new Error('Vous devez être connecté en tant qu\'admin');
        }

        console.log('📤 Envoi de la requête au backend...');

        try {
            const response = await fetch(`${window.API_CONFIG.API_URL}/agences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nom: agenceData.nom,
                    email: agenceData.email,
                    password: agenceData.password,
                    telephone: agenceData.telephone || '',
                    wilaya: agenceData.wilaya,
                    adresse: agenceData.adresse || ''
                })
            });

            const result = await response.json();

            console.log('📥 Réponse du backend:', result);

            if (!response.ok) {
                console.error('❌ Erreur:', result);
                throw new Error(result.message || 'Erreur lors de la création de l\'agence');
            }

            console.log('✅ Agence créée dans le backend:', result);

            // Ajouter aussi au localStorage pour l'affichage immédiat
            const newAgence = {
                id: result.data.agence._id,
                code: result.data.agence.code,
                nom: agenceData.nom,
                wilaya: agenceData.wilaya,
                wilayaText: agenceData.wilayaText || `Wilaya ${agenceData.wilaya}`,
                telephone: agenceData.telephone || '',
                email: agenceData.email,
                status: 'active',
                dateCreation: new Date().toISOString()
            };

            this.agences.push(newAgence);
            this.saveAgences();

            return newAgence;

        } catch (error) {
            console.error('❌ Erreur backend:', error);
            throw error;
        }
    }

    updateAgence(id, data) {
        const index = this.agences.findIndex(a => a.id === id);
        if (index === -1) {
            throw new Error('Agence non trouvée');
        }

        // Validation du nom lors de la mise à jour
        if (data.nom !== undefined && (!data.nom || data.nom.trim() === '')) {
            throw new Error('Le nom de l\'agence est requis');
        }

        // Si la wilaya change mais qu'il n'y a pas de wilayaText fourni, récupérer le nouveau nom
        if (data.wilaya && !data.wilayaText) {
            try {
                const savedWilayas = localStorage.getItem('wilayas');
                if (savedWilayas) {
                    const wilayas = JSON.parse(savedWilayas);
                    const wilayaInfo = wilayas.find(w => w.code === data.wilaya);
                    if (wilayaInfo) {
                        data.wilayaText = wilayaInfo.nom;
                    } else {
                        data.wilayaText = `Wilaya ${data.wilaya}`;
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la récupération du nom de la wilaya:', error);
                data.wilayaText = `Wilaya ${data.wilaya}`;
            }
        }

        // Mettre à jour le code de l'agence si la wilaya change
        if (data.wilaya && data.wilaya !== this.agences[index].wilaya) {
            data.code = this.generateAgenceCode(data.wilaya);
        }

        this.agences[index] = { ...this.agences[index], ...data };
        this.saveAgences();
        return this.agences[index];
    }

    deleteAgence(id) {
        this.agences = this.agences.filter(a => a.id !== id);
        this.saveAgences();
    }

    getActiveAgences() {
        return this.agences.filter(agence => agence.status === 'active');
    }

    getAgencesByWilaya(wilayaCode) {
        return this.agences.filter(agence => 
            agence.status === 'active' && 
            agence.wilaya === wilayaCode
        );
    }

    getAgence(id) {
        return this.agences.find(a => a.id === id);
    }

    generateAgenceCode(wilaya) {
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `AG${year}${month}-${wilaya}-${random}`;
    }
}

export const agenceStore = new AgenceStore();