// Βασική κλάση για το Bank System
class BobBank {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.init();
    }
    
    // Φόρτωση χρηστών από localStorage
    loadUsers() {
        const usersJSON = localStorage.getItem('bobBankUsers');
        return usersJSON ? JSON.parse(usersJSON) : {};
    }
    
    // Αποθήκευση χρηστών στο localStorage
    saveUsers() {
        localStorage.setItem('bobBankUsers', JSON.stringify(this.users));
    }
    
    // Αρχικοποίηση συστήματος
    init() {
        this.bindEvents();
        this.checkForExistingSession();
    }
    
    // Έλεγχος για υπάρχουσα σύνδεση
    checkForExistingSession() {
        const loggedInUser = localStorage.getItem('bobBankLoggedInUser');
        if (loggedInUser && this.users[loggedInUser]) {
            this.currentUser = loggedInUser;
            const user = this.users[loggedInUser];
            
            // Αν ο χρήστης έχει κάρτα, πηγαίνει στο dashboard
            if (user.hasCard) {
                this.showDashboard();
            } else {
                // Διαφορετικά, πρέπει να δημιουργήσει κάρτα
                this.showCardCreationScreen();
            }
        }
    }
    
    // Σύνδεση συμβάντων
    bindEvents() {
        // Welcome screen
        document.getElementById('login-btn').addEventListener('click', () => this.showScreen('login-screen'));
        document.getElementById('register-btn').addEventListener('click', () => this.showScreen('register-screen'));
        
        // Back buttons
        document.getElementById('back-to-welcome-from-register').addEventListener('click', () => this.showScreen('welcome-screen'));
        document.getElementById('back-to-welcome-from-login').addEventListener('click', () => this.showScreen('welcome-screen'));
        
        // Μεταβάσεις μεταξύ φορμών
        document.getElementById('to-login-from-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showScreen('login-screen');
        });
        
        document.getElementById('to-register-from-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showScreen('register-screen');
        });
        
        // Φόρμες
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('card-creation-form').addEventListener('submit', (e) => this.handleCardCreation(e));
        document.getElementById('transfer-form').addEventListener('submit', (e) => this.handleTransfer(e));
        document.getElementById('add-funds-form').addEventListener('submit', (e) => this.handleAddFunds(e));
        
        // Dashboard buttons
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        document.getElementById('new-transfer-btn').addEventListener('click', () => this.showTransferModal());
        document.getElementById('show-card-details-btn').addEventListener('click', () => this.showCardDetailsModal());
        document.getElementById('add-funds-btn').addEventListener('click', () => this.showAddFundsModal());
        
        // Modal buttons
        document.getElementById('close-transfer-modal').addEventListener('click', () => this.hideModal('transfer-modal'));
        document.getElementById('cancel-transfer').addEventListener('click', () => this.hideModal('transfer-modal'));
        document.getElementById('close-card-modal').addEventListener('click', () => this.hideModal('card-details-modal'));
        document.getElementById('close-card-modal-btn').addEventListener('click', () => this.hideModal('card-details-modal'));
        document.getElementById('close-add-funds-modal').addEventListener('click', () => this.hideModal('add-funds-modal'));
        document.getElementById('cancel-add-funds').addEventListener('click', () => this.hideModal('add-funds-modal'));
        
        // Αυτόματη ενημέρωση της προεπισκόπησης κάρτας
        document.getElementById('card-color').addEventListener('change', () => this.updateCardPreview());
        document.getElementById('transfer-amount').addEventListener('input', () => this.checkTransferVerification());
    }
    
    // Εμφάνιση συγκεκριμένης οθόνης
    showScreen(screenId) {
        // Κρύψε όλες τις οθόνες
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Εμφάνισε την επιλεγμένη οθόνη
        document.getElementById(screenId).classList.remove('hidden');
        
        // Ειδικές ενέργειες για κάθε οθόνη
        if (screenId === 'card-creation-screen') {
            this.initializeCardCreation();
        } else if (screenId === 'dashboard') {
            this.updateDashboard();
        }
    }
    
    // Εμφάνιση modal
    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }
    
    // Κρύψιμο modal
    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }
    
    // Επεξεργασία εγγραφής
    handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('reg-username').value.trim();
        const pin = document.getElementById('reg-pin').value;
        const recoveryWord = document.getElementById('reg-recovery').value.trim();
        
        // Έλεγχος για κενά πεδία
        if (!username || !pin || !recoveryWord) {
            this.showNotification('Σφάλμα', 'Παρακαλώ συμπληρώστε όλα τα πεδία.', 'error');
            return;
        }
        
        // Έλεγχος αν το PIN έχει 4 ψηφία
        if (pin.length !== 4 || !/^\d+$/.test(pin)) {
            this.showNotification('Σφάλμα', 'Το PIN πρέπει να είναι ακριβώς 4 ψηφία.', 'error');
            return;
        }
        
        // Έλεγχος αν το όνομα χρήστη υπάρχει ήδη
        if (this.users[username]) {
            this.showNotification('Σφάλμα', 'Το όνομα χρήστη υπάρχει ήδη.', 'error');
            return;
        }
        
        // Δημιουργία νέου χρήστη
        this.users[username] = {
            pin: pin,
            recoveryWord: recoveryWord,
            balance: 100, // Αρχικό ποσό για κάθε νέο χρήστη
            hasCard: false,
            card: null,
            transactions: []
        };
        
        // Αποθήκευση στο localStorage
        this.saveUsers();
        
        this.showNotification('Επιτυχία', 'Ο λογαριασμός δημιουργήθηκε επιτυχώς! Μπορείτε τώρα να συνδεθείτε.', 'success');
        
        // Επαναφορά φόρμας
        document.getElementById('register-form').reset();
        
        // Μεταφορά στην οθόνη σύνδεσης
        this.showScreen('login-screen');
    }
    
    // Επεξεργασία σύνδεσης
    handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value.trim();
        const pin = document.getElementById('login-pin').value;
        
        // Έλεγχος για κενά πεδία
        if (!username || !pin) {
            this.showNotification('Σφάλμα', 'Παρακαλώ συμπληρώστε όλα τα πεδία.', 'error');
            return;
        }
        
        // Έλεγχος αν ο χρήστης υπάρχει
        if (!this.users[username]) {
            this.showNotification('Σφάλμα', 'Το όνομα χρήστη δεν βρέθηκε.', 'error');
            return;
        }
        
        // Έλεγχος PIN
        if (this.users[username].pin !== pin) {
            this.showNotification('Σφάλμα', 'Το PIN είναι λανθασμένο.', 'error');
            return;
        }
        
        // Επιτυχής σύνδεση
        this.currentUser = username;
        
        // Αποθήκευση τρέχουσας σύνδεσης
        localStorage.setItem('bobBankLoggedInUser', username);
        
        // Εμφάνιση σχετικής οθόνης
        if (this.users[username].hasCard) {
            this.showDashboard();
        } else {
            this.showCardCreationScreen();
        }
        
        // Επαναφορά φόρμας
        document.getElementById('login-form').reset();
        
        this.showNotification('Επιτυχία', `Καλωσορίσατε, ${username}!`, 'success');
    }
    
    // Εμφάνιση οθόνης δημιουργίας κάρτας
    showCardCreationScreen() {
        this.showScreen('card-creation-screen');
    }
    
    // Αρχικοποίηση δημιουργίας κάρτας
    initializeCardCreation() {
        // Δημιουργία προεπισκόπησης κάρτας
        this.updateCardPreview();
        
        // Δημιουργία τυχαίου αριθμού κάρτας
        this.generateCardNumber();
        
        // Δημιουργία τυχαίου CVV
        this.generateCVV();
        
        // Δημιουργία ημερομηνίας λήξης
        this.generateExpiryDate();
    }
    
    // Δημιουργία τυχαίου αριθμού κάρτας
    generateCardNumber() {
        // Πρώτο ψηφίο: 4 ή 5
        const firstDigit = Math.random() < 0.5 ? '4' : '5';
        
        // Υπόλοιπα 15 ψηφία τυχαία
        let rest = '';
        for (let i = 0; i < 15; i++) {
            rest += Math.floor(Math.random() * 10);
        }
        
        // Συνδυασμός με διαστήματα κάθε 4 ψηφία
        const fullNumber = firstDigit + rest;
        const formattedNumber = fullNumber.match(/.{1,4}/g).join(' ');
        
        // Ενημέρωση προεπισκόπησης
        document.getElementById('generated-card-number').textContent = formattedNumber;
        document.getElementById('preview-card-number').textContent = formattedNumber;
        
        return formattedNumber;
    }
    
    // Δημιουργία τυχαίου CVV
    generateCVV() {
        const cvv = Math.floor(100 + Math.random() * 900).toString();
        document.getElementById('generated-cvv').textContent = cvv;
        return cvv;
    }
    
    // Δημιουργία ημερομηνίας λήξης
    generateExpiryDate() {
        // Τρέχον μήνας και έτος
        const now = new Date();
        const month = now.getMonth() + 1; // 1-12
        const year = now.getFullYear() + 3; // Λήξη σε 3 χρόνια
        
        // Μορφοποίηση: MM/YY
        const formattedMonth = month.toString().padStart(2, '0');
        const formattedYear = year.toString().slice(-2);
        const expiryDate = `${formattedMonth}/${formattedYear}`;
        
        document.getElementById('generated-expiry').textContent = expiryDate;
        document.getElementById('preview-card-expiry').textContent = expiryDate;
        
        return expiryDate;
    }
    
    // Ενημέρωση προεπισκόπησης κάρτας
    updateCardPreview() {
        const colorSelect = document.getElementById('card-color');
        const cardPreview = document.getElementById('card-preview');
        
        if (colorSelect.value) {
            cardPreview.style.backgroundColor = colorSelect.value;
            
            // Βεβαιωθείτε ότι το κείμενο είναι ορατό στο επιλεγμένο χρώμα
            const rgb = this.hexToRgb(colorSelect.value);
            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            cardPreview.style.color = brightness > 125 ? '#333' : 'white';
        }
        
        // Ενημέρωση ονόματος κατόχου
        if (this.currentUser) {
            document.getElementById('preview-card-holder').textContent = this.currentUser;
        }
    }
    
    // Μετατροπή hex σε RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
    
    // Επεξεργασία δημιουργίας κάρτας
    handleCardCreation(e) {
        e.preventDefault();
        
        const colorSelect = document.getElementById('card-color');
        
        if (!colorSelect.value) {
            this.showNotification('Σφάλμα', 'Παρακαλώ επιλέξτε χρώμα για την κάρτα σας.', 'error');
            return;
        }
        
        // Δημιουργία κάρτας
        const cardNumber = document.getElementById('generated-card-number').textContent;
        const cvv = document.getElementById('generated-cvv').textContent;
        const expiry = document.getElementById('generated-expiry').textContent;
        const color = colorSelect.value;
        
        // Αποθήκευση κάρτας στο χρήστη
        this.users[this.currentUser].card = {
            number: cardNumber.replace(/\s/g, ''), // Αφαίρεση διαστημάτων
            formattedNumber: cardNumber,
            cvv: cvv,
            expiry: expiry,
            color: color
        };
        
        this.users[this.currentUser].hasCard = true;
        
        // Αποθήκευση αλλαγών
        this.saveUsers();
        
        this.showNotification('Επιτυχία', 'Η κάρτα σας εκδόθηκε επιτυχώς!', 'success');
        
        // Μετάβαση στο dashboard
        setTimeout(() => {
            this.showDashboard();
        }, 1500);
    }
    
    // Εμφάνιση dashboard
    showDashboard() {
        this.showScreen('dashboard');
        this.updateDashboard();
    }
    
    // Ενημέρωση dashboard
    updateDashboard() {
        if (!this.currentUser) return;
        
        const user = this.users[this.currentUser];
        
        // Ενημέρωση ονόματος χρήστη
        document.getElementById('dashboard-username').textContent = this.currentUser;
        
        // Ενημέρωση υπολοίπου
        document.getElementById('current-balance').textContent = `€${user.balance.toFixed(2)}`;
        
        // Ενημέρωση προβολής κάρτας
        this.updateUserCardDisplay();
        
        // Ενημέρωση λίστας συναλλαγών
        this.updateTransactionsList();
    }
    
    // Ενημέρωση προβολής κάρτας χρήστη
    updateUserCardDisplay() {
        const user = this.users[this.currentUser];
        const cardDisplay = document.getElementById('user-card-display');
        
        if (user.hasCard && user.card) {
            cardDisplay.innerHTML = `
                <div class="card" style="background-color: ${user.card.color};">
                    <div class="magnetic-stripe"></div>
                    <div class="card-content" style="color: ${this.getContrastColor(user.card.color)};">
                        <div class="card-logo">
                            <i class="fas fa-university"></i>
                            <span>Bob Bank</span>
                        </div>
                        <div class="card-number">${this.maskCardNumber(user.card.formattedNumber)}</div>
                        <div class="card-details">
                            <div class="card-holder">
                                <div class="label">Κάτοχος</div>
                                <div class="value">${this.currentUser}</div>
                            </div>
                            <div class="card-expiry">
                                <div class="label">Λήξη</div>
                                <div class="value">${user.card.expiry}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            cardDisplay.innerHTML = `
                <div class="no-card">
                    <i class="fas fa-credit-card" style="font-size: 3rem; color: #ccc; margin-bottom: 15px;"></i>
                    <p>Δεν έχετε εκδόσει κάρτα ακόμα</p>
                </div>
            `;
        }
    }
    
    // Επιστροφή κατάλληλου χρώματος κειμένου για το background
    getContrastColor(hexColor) {
        const rgb = this.hexToRgb(hexColor);
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 125 ? '#333' : 'white';
    }
    
    // Απόκρυψη μερικών ψηφίων της κάρτας
    maskCardNumber(cardNumber) {
        const parts = cardNumber.split(' ');
        if (parts.length === 4) {
            return `**** **** **** ${parts[3]}`;
        }
        return cardNumber;
    }
    
    // Ενημέρωση λίστας συναλλαγών
    updateTransactionsList() {
        const user = this.users[this.currentUser];
        const transactionsList = document.getElementById('transactions-list');
        
        if (user.transactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="empty-transactions">
                    <i class="fas fa-receipt"></i>
                    <p>Δεν υπάρχουν συναλλαγές ακόμα</p>
                </div>
            `;
            return;
        }
        
        // Ταξινόμηση συναλλαγών από νεότερες προς παλιότερες
        const sortedTransactions = [...user.transactions].reverse();
        
        transactionsList.innerHTML = sortedTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-type ${transaction.type}">
                        ${transaction.type === 'received' ? 'Εισερχόμενη Μεταφορά' : 'Εξερχόμενη Μεταφορά'}
                    </div>
                    <div class="transaction-details">
                        ${transaction.type === 'received' ? `Από: ${transaction.from}` : `Προς: ${transaction.to}`} | ${transaction.date}
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type === 'received' ? 'positive' : 'negative'}">
                    ${transaction.type === 'received' ? '+' : '-'}€${transaction.amount.toFixed(2)}
                </div>
            </div>
        `).join('');
    }
    
    // Εμφάνιση modal μεταφοράς
    showTransferModal() {
        // Επαναφορά φόρμας
        document.getElementById('transfer-form').reset();
        document.getElementById('card-verification-section').classList.add('hidden');
        
        this.showModal('transfer-modal');
    }
    
    // Έλεγχος αν απαιτείται επαλήθευση κάρτας
    checkTransferVerification() {
        const amount = parseFloat(document.getElementById('transfer-amount').value) || 0;
        const verificationSection = document.getElementById('card-verification-section');
        
        if (amount > 50) {
            verificationSection.classList.remove('hidden');
        } else {
            verificationSection.classList.add('hidden');
        }
    }
    
    // Επεξεργασία μεταφοράς
    async handleTransfer(e) {
        e.preventDefault();
        
        const recipientUsername = document.getElementById('recipient-username').value.trim();
        const amount = parseFloat(document.getElementById('transfer-amount').value);
        
        // Βασικοί έλεγχοι
        if (!recipientUsername || !amount || amount <= 0) {
            this.showNotification('Σφάλμα', 'Παρακαλώ εισάγετε έγκυρα στοιχεία μεταφοράς.', 'error');
            return;
        }
        
        // Έλεγχος αν ο παραλήπτης είναι ο ίδιος
        if (recipientUsername === this.currentUser) {
            this.showNotification('Σφάλμα', 'Δεν μπορείτε να κάνετε μεταφορά στον εαυτό σας.', 'error');
            return;
        }
        
        // Έλεγχος αν ο παραλήπτης υπάρχει
        if (!this.users[recipientUsername]) {
            this.showNotification('Σφάλμα', 'Ο παραλήπτης δεν βρέθηκε.', 'error');
            return;
        }
        
        // Έλεγχος αν έχει αρκετό υπόλοιπο
        if (this.users[this.currentUser].balance < amount) {
            this.showNotification('Σφάλμα', 'Δεν έχετε αρκετό υπόλοιπο για αυτή τη μεταφορά.', 'error');
            return;
        }
        
        // Έλεγχος για μεταφορές άνω των 50€
        if (amount > 50) {
            const cardNumber = document.getElementById('verify-card-number').value.replace(/\s/g, '');
            const cvv = document.getElementById('verify-cvv').value;
            const pin = document.getElementById('verify-pin').value;
            
            // Έλεγχος κάρτας
            const userCard = this.users[this.currentUser].card;
            
            if (!userCard) {
                this.showNotification('Σφάλμα', 'Δεν έχετε εκδόσει κάρτα.', 'error');
                return;
            }
            
            if (cardNumber !== userCard.number) {
                this.showNotification('Σφάλμα', 'Ο αριθμός κάρτας είναι λανθασμένος.', 'error');
                return;
            }
            
            if (cvv !== userCard.cvv) {
                this.showNotification('Σφάλμα', 'Το CVV είναι λανθασμένο.', 'error');
                return;
            }
            
            if (pin !== this.users[this.currentUser].pin) {
                this.showNotification('Σφάλμα', 'Το PIN είναι λανθασμένο.', 'error');
                return;
            }
        }
        
        // Προβολή animation POS
        await this.showPOSAnimation(amount);
        
        // Εκτέλεση μεταφοράς
        const date = new Date().toLocaleDateString('el-GR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Κατάθεση στον παραλήπτη
        this.users[recipientUsername].balance += amount;
        this.users[recipientUsername].transactions.push({
            type: 'received',
            from: this.currentUser,
            amount: amount,
            date: date
        });
        
        // Αφαίρεση από τον αποστολέα
        this.users[this.currentUser].balance -= amount;
        this.users[this.currentUser].transactions.push({
            type: 'sent',
            to: recipientUsername,
            amount: amount,
            date: date
        });
        
        // Αποθήκευση αλλαγών
        this.saveUsers();
        
        // Ενημέρωση dashboard
        this.updateDashboard();
        
        // Κλείσιμο modal
        this.hideModal('transfer-modal');
        
        this.showNotification('Επιτυχία', `Η μεταφορά των €${amount.toFixed(2)} ολοκληρώθηκε επιτυχώς.`, 'success');
    }
    
    // Προβολή animation POS
    showPOSAnimation(amount) {
        return new Promise(resolve => {
            const animation = document.getElementById('pos-animation');
            const cardSwipe = document.getElementById('card-swipe');
            const posAmount = document.querySelector('.pos-amount');
            const user = this.users[this.currentUser];
            
            // Ορισμός στοιχείων animation
            posAmount.textContent = `€${amount.toFixed(2)}`;
            
            if (user.hasCard && user.card) {
                cardSwipe.style.backgroundColor = user.card.color;
                cardSwipe.style.color = this.getContrastColor(user.card.color);
                cardSwipe.innerHTML = `
                    <div class="card-content">
                        <div style="font-size: 0.9rem; margin-bottom: 5px;">Bob Bank</div>
                        <div>${this.maskCardNumber(user.card.formattedNumber)}</div>
                    </div>
                `;
            }
            
            // Εμφάνιση animation
            animation.classList.remove('hidden');
            
            // Έναρξη animation
            setTimeout(() => {
                cardSwipe.classList.add('swiping');
            }, 500);
            
            // Λήξη animation και απόκρυψη
            setTimeout(() => {
                cardSwipe.classList.remove('swiping');
                setTimeout(() => {
                    animation.classList.add('hidden');
                    resolve();
                }, 500);
            }, 2500);
        });
    }
    
    // Εμφάνιση modal λεπτομερειών κάρτας
    showCardDetailsModal() {
        const user = this.users[this.currentUser];
        
        if (!user.hasCard || !user.card) {
            this.showNotification('Σφάλμα', 'Δεν έχετε εκδόσει κάρτα.', 'error');
            return;
        }
        
        // Ενημέρωση στοιχείων κάρτας
        document.getElementById('details-card-preview').style.backgroundColor = user.card.color;
        document.getElementById('details-card-preview').querySelector('.card-content').style.color = this.getContrastColor(user.card.color);
        document.getElementById('details-card-number').textContent = user.card.formattedNumber;
        document.getElementById('details-card-number-text').textContent = user.card.formattedNumber;
        document.getElementById('details-card-holder').textContent = this.currentUser;
        document.getElementById('details-card-expiry').textContent = user.card.expiry;
        document.getElementById('details-expiry').textContent = user.card.expiry;
        document.getElementById('details-cvv').textContent = user.card.cvv;
        document.getElementById('details-balance').textContent = `€${user.balance.toFixed(2)}`;
        
        this.showModal('card-details-modal');
    }
    
    // Εμφάνιση modal κατάθεσης
    showAddFundsModal() {
        document.getElementById('add-funds-form').reset();
        this.showModal('add-funds-modal');
    }
    
    // Επεξεργασία κατάθεσης
    handleAddFunds(e) {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('add-funds-amount').value);
        
        if (!amount || amount <= 0) {
            this.showNotification('Σφάλμα', 'Παρακαλώ εισάγετε έγκυρο ποσό.', 'error');
            return;
        }
        
        // Προσθήκη ποσού
        this.users[this.currentUser].balance += amount;
        
        // Προσθήκη συναλλαγής
        const date = new Date().toLocaleDateString('el-GR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        this.users[this.currentUser].transactions.push({
            type: 'received',
            from: 'Κατάθεση',
            amount: amount,
            date: date
        });
        
        // Αποθήκευση αλλαγών
        this.saveUsers();
        
        // Ενημέρωση dashboard
        this.updateDashboard();
        
        // Κλείσιμο modal
        this.hideModal('add-funds-modal');
        
        this.showNotification('Επιτυχία', `Κατατέθηκε επιτυχώς το ποσό των €${amount.toFixed(2)}.`, 'success');
    }
    
    // Αποσύνδεση
    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('bobBankLoggedInUser');
        this.showScreen('welcome-screen');
        this.showNotification('Πληροφορία', 'Αποσυνδεθήκατε επιτυχώς.', 'success');
    }
    
    // Εμφάνιση ειδοποίησης
    showNotification(title, message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        if (type === 'warning') icon = 'fa-exclamation-triangle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Αυτόματη αφαίρεση μετά από 5 δευτερόλεπτα
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Αρχικοποίηση του συστήματος όταν φορτωθεί η σελίδα
document.addEventListener('DOMContentLoaded', () => {
    window.bobBank = new BobBank();
});