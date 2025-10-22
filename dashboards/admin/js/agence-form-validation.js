// Fonction de validation du formulaire d'agence
export function setupAgenceFormValidation() {
    const form = document.getElementById('agenceForm');
    const nameInput = document.getElementById('agenceName');

    if (!form || !nameInput) return;

    // Ajout des classes nécessaires
    nameInput.classList.add('form-control');
    const label = nameInput.previousElementSibling;
    if (label) {
        label.classList.add('required-field');
    }

    // Créer le message d'erreur s'il n'existe pas
    let errorMessage = document.getElementById('agenceNameError');
    if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.id = 'agenceNameError';
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Le nom de l\'agence est requis';
        nameInput.parentNode.appendChild(errorMessage);
    }

    // Validation en temps réel
    nameInput.addEventListener('input', function() {
        validateAgenceName(this);
    });

    // Validation au blur
    nameInput.addEventListener('blur', function() {
        validateAgenceName(this);
    });

    // Surcharge du comportement par défaut du formulaire
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validation du nom
        if (!validateAgenceName(nameInput)) {
            nameInput.focus();
            return;
        }

        // Validation de la wilaya
        const wilayaSelect = document.getElementById('agenceWilayaSelect');
        if (!wilayaSelect?.value) {
            alert('Veuillez sélectionner une wilaya');
            wilayaSelect?.focus();
            return;
        }

        // Si tout est valide, on peut soumettre
        try {
            submitAgenceForm(this);
        } catch (error) {
            alert(error.message);
            if (error.message.includes('nom')) {
                nameInput.focus();
            }
        }
    });
}

// Validation du nom de l'agence
function validateAgenceName(input) {
    const value = input.value.trim();
    const errorElement = document.getElementById('agenceNameError');
    
    if (!value) {
        input.classList.add('invalid');
        input.classList.remove('valid');
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.classList.add('error-shake');
            setTimeout(() => errorElement.classList.remove('error-shake'), 500);
        }
        return false;
    } 
    
    input.classList.remove('invalid');
    input.classList.add('valid');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    return true;
}

// Soumission du formulaire
async function submitAgenceForm(form) {
    const formData = {
        nom: document.getElementById('agenceName').value.trim(),
        wilaya: document.getElementById('agenceWilayaSelect').value,
        telephone: document.getElementById('agencePhone')?.value?.trim() || '',
        email: document.getElementById('agenceEmail')?.value?.trim() || '',
        password: document.getElementById('agencePassword')?.value || ''
    };

    if (!formData.nom) {
        throw new Error('Le nom de l\'agence est requis');
    }

    // Ici, vous pouvez ajouter le code pour sauvegarder l'agence
    console.log('Données du formulaire:', formData);
}