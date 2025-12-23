// Μορφοποίηση αριθμού κάρτας κατά την πληκτρολόγηση
document.getElementById('cardNumber').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();
    e.target.value = formattedValue.substring(0, 19);
});

// Μορφοποίηση ημερομηνίας λήξης
document.getElementById('expiryDate').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value.substring(0, 5);
});

// Περιορισμός CVV σε αριθμούς
document.getElementById('cvv').addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
});

// Μετατροπή ονόματος σε κεφαλαία
document.getElementById('cardName').addEventListener('input', function(e) {
    e.target.value = e.target.value.toUpperCase();
});

// Επεξεργασία φόρμας
document.getElementById('cardForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Λήψη τιμών από τη φόρμα
    const cardNumber = document.getElementById('cardNumber').value;
    const cardName = document.getElementById('cardName').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    
    // Έλεγχος βασικών στοιχείων
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
        alert('Παρακαλώ συμπληρώστε όλα τα απαραίτητα πεδία.');
        return;
    }
    
    // Έλεγχος αν ο αριθμός κάρτας έχει τουλάχιστον 16 ψηφία
    if (cardNumber.replace(/\s/g, '').length < 16) {
        alert('Ο αριθμός κάρτας πρέπει να έχει τουλάχιστον 16 ψηφία.');
        return;
    }
    
    // Έλεγχος αν το CVV έχει 3 ψηφία
    if (cvv.length < 3) {
        alert('Ο κωδικός ασφαλείας (CVV) πρέπει να έχει 3 ψηφία.');
        return;
    }
    
    // Προσομοίωση επεξεργασίας
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Επαλήθευση με τράπεζα...';
    document.getElementById('submitBtn').disabled = true;
    
    // Προσομοίωση καθυστέρησης επικοινωνίας με τράπεζα
    setTimeout(function() {
        // Έλεγχος αν η ημερομηνία λήξης είναι 03/25
        if (expiryDate === '03/25') {
            // Επιτυχής επαλήθευση - εμφάνιση link
            document.getElementById('formSection').style.display = 'none';
            document.getElementById('errorSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'block';
            
            // Προσθήκη κλικ στο link για άνοιγμα σε νέα καρτέλα
            document.getElementById('generatedLink').addEventListener('click', function() {
                window.open('https://drive.proton.me/urls/9YX22VDNRM#JFmJJQGy1g4v', '_blank');
            });
        } else {
            // Αποτυχία επαλήθευσης - εμφάνιση σφάλματος
            document.getElementById('formSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'none';
            document.getElementById('errorSection').style.display = 'block';
        }
        
        // Επαναφορά του κουμπιού
        document.getElementById('submitBtn').innerHTML = '<i class="fas fa-paper-plane"></i> Εισαγωγή Κάρτας';
        document.getElementById('submitBtn').disabled = false;
        
    }, 2000); // 2 δευτερόλεπτα προσομοίωση καθυστέρησης
});

// Αντιγραφή link στο clipboard
document.getElementById('copyBtn').addEventListener('click', function() {
    const link = document.getElementById('generatedLink').href;
    
    navigator.clipboard.writeText(link).then(function() {
        const originalText = document.getElementById('copyBtn').innerHTML;
        document.getElementById('copyBtn').innerHTML = '<i class="fas fa-check"></i> Αντιγράφηκε!';
        document.getElementById('copyBtn').style.background = '#38a169';
        
        setTimeout(function() {
            document.getElementById('copyBtn').innerHTML = originalText;
            document.getElementById('copyBtn').style.background = '';
        }, 2000);
    }).catch(function(err) {
        console.error('Σφάλμα αντιγραφής: ', err);
        alert('Δεν ήταν δυνατή η αντιγραφή. Παρακαλώ αντιγράψτε το link χειροκίνητα.');
    });
});

// Κουμπί "Δοκιμάστε Ξανά" για επιστροφή στη φόρμα
document.getElementById('tryAgainBtn').addEventListener('click', function() {
    document.getElementById('errorSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('formSection').style.display = 'block';
    
    // Μηδενισμό μόνο του πεδίου ημερομηνίας λήξης για διευκόλυνση
    document.getElementById('expiryDate').value = '';
    document.getElementById('expiryDate').focus();
});

// Κλικ στο header για επαναφορά
document.querySelector('header').addEventListener('click', function() {
    document.getElementById('errorSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('formSection').style.display = 'block';
    document.getElementById('cardForm').reset();
});

// Προσομοίωση τυχαίου αριθμού κάρτας για δοκιμή
document.getElementById('cardNumber').addEventListener('dblclick', function() {
    // Δημιουργία τυχαίου αριθμού κάρτας για διευκόλυνση δοκιμών
    const randomCardNumber = Array.from({length: 4}, () => 
        Math.floor(1000 + Math.random() * 9000)
    ).join(' ');
    document.getElementById('cardNumber').value = randomCardNumber;
});

// Προσομοίωση τυχαίου ονόματος για δοκιμή
document.getElementById('cardName').addEventListener('dblclick', function() {
    document.getElementById('cardName').value = 'ΝΙΚΟΣ ΠΑΠΑΔΟΠΟΥΛΟΣ';
});

// Προσομοίωση τυχαίου CVV για δοκιμή
document.getElementById('cvv').addEventListener('dblclick', function() {
    document.getElementById('cvv').value = Math.floor(100 + Math.random() * 900);
});
