// Initialize users and transaction logs
let users = JSON.parse(localStorage.getItem('users')) || [];
let transactionLogs = JSON.parse(localStorage.getItem('transactionLogs')) || [];

if (users.length === 0) {
    users.push(
        { username: 'user', password: 'password', isAdmin: false, balance: 0, isBanned: false },
        { username: '0629482089267', password: 'Thomas280808', isAdmin: false, balance: 0, isBanned: false },
        { username: 'Thomas', password: 'Thomas', isAdmin: false, balance: 0, isBanned: false },
        { username: 'test_ban', password: 'password', isAdmin: false, balance: 0, isBanned: true },
        { username: 'Admin', password: 'Pepeci67310', isAdmin: true, balance: 1000, isBanned: false }
    );
    localStorage.setItem('users', JSON.stringify(users));
}

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
if (currentUser) {
    const foundUser = users.find(u => u.username === currentUser.username);
    if (foundUser) {
        currentUser = foundUser;
    }
}

function logTransaction(sender, receiver, amount, type) {
    const logEntry = {
        sender: sender,
        receiver: receiver,
        amount: amount,
        type: type,
        date: new Date().toLocaleString()
    };
    transactionLogs.push(logEntry);
    localStorage.setItem('transactionLogs', JSON.stringify(transactionLogs));

    addLogToSection(`${sender} a effectué une transaction de ${amount} € vers ${receiver} le ${logEntry.date}`);
    if (receiver === currentUser.username) {
        addLogToSection(`${receiver} a reçu une transaction de ${amount} € de ${sender} le ${logEntry.date}`);
    }
}

function addLogToSection(logText) {
    const logsSection = document.getElementById('transaction-logs');
    const logItem = document.createElement('li');
    logItem.textContent = logText;
    logsSection.insertBefore(logItem, logsSection.firstChild);
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        if (user.isBanned) {
            Swal.fire('Votre compte est banni. Veuillez contacter le support pour plus d\'informations.');
        } else {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            document.getElementById('login-section').style.display = 'none';

            if (user.isAdmin) {
                document.getElementById('admin-section').style.display = 'block';
            }

            document.getElementById('balance-section').style.display = 'block';
            document.getElementById('transaction-section').style.display = 'block';
            document.getElementById('logs-section').style.display = 'block';
            updateBalance();
        }
    } else {
        Swal.fire('Nom d\'utilisateur ou mot de passe incorrect. Veuillez contacter votre banque pour obtenir un compte si vous n\'avez pas de compte.');
        document.getElementById('logs-section').style.display = 'none';
        updateBalance();
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('admin-section').style.display = 'none';
    document.getElementById('balance-section').style.display = 'none';
    document.getElementById('transaction-section').style.display = 'none';
    document.getElementById('logs-section').style.display = 'none';
}

function updateBalance() {
    const balanceElement = document.getElementById('balance');
    const balanceAmount = currentUser.balance;
    const formattedBalance = balanceAmount >= 0 ? `+${balanceAmount}` : `${balanceAmount}`;
    balanceElement.classList.toggle('negative', balanceAmount < 0);
    balanceElement.innerText = `${formattedBalance} €`;
    balanceElement.classList.add('fade-in');
    setTimeout(() => {
        balanceElement.classList.remove('fade-in');
    }, 1000);
}

function addFunds() {
    if (isAdmin()) {
        Swal.fire({
            title: 'Entrez le nom d\'utilisateur du compte à créditer :',
            input: 'text',
            showCancelButton: true,
            confirmButtonText: 'Ajouter des fonds'
        }).then(result => {
            if (result.isConfirmed) {
                const username = result.value;
                const userToAddFunds = users.find(u => u.username === username);

                if (userToAddFunds && !userToAddFunds.isAdmin) {
                    Swal.fire({
                        title: 'Entrez le montant à ajouter :',
                        input: 'number',
                        showCancelButton: true,
                        confirmButtonText: 'Ajouter'
                    }).then(result => {
                        if (result.isConfirmed) {
                            const amount = parseFloat(result.value);
                            if (!isNaN(amount) && amount > 0) {
                                userToAddFunds.balance += amount;
                                localStorage.setItem('users', JSON.stringify(users));
                                updateBalance();
                                Swal.fire(`Fonds ajoutés avec succès au compte de ${username}. Nouveau solde : ${userToAddFunds.balance} €`);
                                logTransaction(currentUser.username, username, amount, 'addFunds');
                            } else {
                                Swal.fire('Veuillez entrer un montant valide.');
                            }
                        }
                    });
                } else {
                    Swal.fire('Utilisateur non trouvé ou ne peut pas recevoir de fonds.');
                }
            }
        });
    } else {
        Swal.fire('Vous n\'avez pas les autorisations pour cette fonctionnalité.');
    }
}

function withdrawFunds() {
    if (isAdmin()) {
        Swal.fire({
            title: 'Entrez le nom d\'utilisateur du compte à débiter :',
            input: 'text',
            showCancelButton: true,
            confirmButtonText: 'Retirer des fonds'
        }).then(result => {
            if (result.isConfirmed) {
                const username = result.value;
                const userToWithdrawFunds = users.find(u => u.username === username);

                if (userToWithdrawFunds && !userToWithdrawFunds.isAdmin) {
                    Swal.fire({
                        title: 'Entrez le montant à retirer :',
                        input: 'number',
                        showCancelButton: true,
                        confirmButtonText: 'Retirer'
                    }).then(result => {
                        if (result.isConfirmed) {
                            const amount = parseFloat(result.value);
                            if (!isNaN(amount) && amount > 0) {
                                userToWithdrawFunds.balance -= amount;
                                localStorage.setItem('users', JSON.stringify(users));
                                updateBalance();
                                Swal.fire(`Fonds retirés avec succès du compte de ${username}. Nouveau solde : ${userToWithdrawFunds.balance} €`);
                                logTransaction(currentUser.username, username, amount, 'withdrawFunds');
                            } else {
                                Swal.fire('Montant invalide.');
                            }
                        }
                    });
                } else {
                    Swal.fire('Utilisateur non trouvé ou ne peut pas être débité.');
                }
            }
        });
    } else {
        Swal.fire('Vous n\'avez pas les autorisations pour cette fonctionnalité.');
    }
}

function modifyAccountAdmin() {
    if (isAdmin()) {
        Swal.fire({
            title: 'Entrez le nom d\'utilisateur du compte à modifier :',
            input: 'text',
            showCancelButton: true,
            confirmButtonText: 'Modifier'
        }).then(result => {
            if (result.isConfirmed) {
                const username = result.value;
                const userToModify = users.find(u => u.username === username);

                if (userToModify && !userToModify.isAdmin) {
                    Swal.fire({
                        title: 'Entrez le nouveau nom d\'utilisateur (laissez vide pour ne pas modifier) :',
                        input: 'text',
                        showCancelButton: true,
                        confirmButtonText: 'Modifier'
                    }).then(newUsernameResult => {
                        if (newUsernameResult.isConfirmed) {
                            const newUsername = newUsernameResult.value;

                            Swal.fire({
                                title: 'Entrez le nouveau mot de passe (laissez vide pour ne pas modifier) :',
                                input: 'password',
                                showCancelButton: true,
                                confirmButtonText: 'Modifier'
                            }).then(newPasswordResult => {
                                if (newPasswordResult.isConfirmed) {
                                    const newPassword = newPasswordResult.value;

                                    if (newUsername) {
                                        userToModify.username = newUsername;
                                    }

                                    if (newPassword) {
                                        userToModify.password = newPassword;
                                    }

                                    localStorage.setItem('users', JSON.stringify(users));
                                    Swal.fire(`Compte de ${username} modifié avec succès.`);
                                    displayUserInfo();
                                }
                            });
                        }
                    });
                } else {
                    Swal.fire('Utilisateur non trouvé ou ne peut pas être modifié.');
                }
            }
        });
    } else {
        Swal.fire('Vous n\'avez pas les autorisations pour cette fonctionnalité.');
    }
}

function displayUserInfo() {
    const userInfoSection = document.getElementById('user-info-section');
    userInfoSection.innerHTML = '';
    if (currentUser) {
        const userInfo = document.createElement('p');
        userInfo.textContent = `Nom d'utilisateur : ${currentUser.username}, Solde : ${currentUser.balance} €`;
        userInfoSection.appendChild(userInfo);
    }
}

function isAdmin() {
    return currentUser && currentUser.isAdmin;
}

function accessAdmin() {
    Swal.fire({
        title: 'Entrez le mot de passe administrateur :',
        input: 'password',
        showCancelButton: true,
        confirmButtonText: 'Accéder'
    }).then(result => {
        if (result.isConfirmed) {
            const adminPassword = result.value;
            if (adminPassword === 'Pepeci67310') {
                currentUser = users.find(u => u.username === 'Admin');
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                document.getElementById('login-section').style.display = 'none';
                document.getElementById('admin-section').style.display = 'block';
                document.getElementById('balance-section').style.display = 'block';
                document.getElementById('transaction-section').style.display = 'block';
                updateBalance();
            } else {
                Swal.fire('Mot de passe incorrect.');
            }
        }
    });
}

function addAdmin() {
    if (isAdmin()) {
        Swal.fire({
            title: 'Entrez le nom d\'utilisateur du nouveau administrateur :',
            input: 'text',
            showCancelButton: true,
            confirmButtonText: 'Ajouter'
        }).then(result => {
            if (result.isConfirmed) {
                const newAdminUsername = result.value;

                Swal.fire({
                    title: 'Entrez le mot de passe du nouveau administrateur :',
                    input: 'password',
                    showCancelButton: true,
                    confirmButtonText: 'Ajouter'
                }).then(passwordResult => {
                    if (passwordResult.isConfirmed) {
                        const newAdminPassword = passwordResult.value;

                        if (newAdminUsername && newAdminPassword) {
                            if (!users.some(u => u.username === newAdminUsername)) {
                                const newAdmin = { username: newAdminUsername, password: newAdminPassword, isAdmin: true, balance: 0 };
                                users.push(newAdmin);
                                localStorage.setItem('users', JSON.stringify(users));
                                Swal.fire('Nouvel administrateur ajouté avec succès.');
                            } else {
                                Swal.fire('Ce nom d\'utilisateur est déjà pris. Veuillez choisir un autre nom.');
                            }
                        } else {
                            Swal.fire('Veuillez remplir tous les champs.');
                        }
                    }
                });
            }
        });
    } else {
        Swal.fire('Vous n\'avez pas les autorisations pour cette fonctionnalité.');
    }
}

function transferFunds() {
    if (currentUser) {
        Swal.fire({
            title: 'Entrez le nom d\'utilisateur du bénéficiaire :',
            input: 'text',
            showCancelButton: true,
            confirmButtonText: 'Transférer'
        }).then(result => {
            if (result.isConfirmed) {
                const targetUsername = result.value;
                const targetUser = users.find(u => u.username === targetUsername);

                if (targetUser && targetUser.username !== currentUser.username) {
                    Swal.fire({
                        title: 'Entrez le montant à transférer :',
                        input: 'number',
                        showCancelButton: true,
                        confirmButtonText: 'Transférer'
                    }).then(amountResult => {
                        if (amountResult.isConfirmed) {
                            const amount = parseFloat(amountResult.value);
                            if (!isNaN(amount) && amount > 0 && currentUser.balance >= amount) {
                                currentUser.balance -= amount;
                                targetUser.balance += amount;
                                localStorage.setItem('users', JSON.stringify(users));
                                Swal.fire(`Transfert de ${amount} € à ${targetUsername} effectué avec succès.`);
                                updateBalance();
                                logTransaction(currentUser.username, targetUsername, amount, 'transfer');
                            } else {
                                Swal.fire('Montant invalide ou solde insuffisant.');
                            }
                        }
                    });
                } else {
                    Swal.fire('Bénéficiaire non trouvé ou invalide.');
                }
            }
        });
    } else {
        Swal.fire('Vous devez être connecté pour effectuer un transfert.');
    }
}

function purchase() {
    const amount = parseFloat(document.getElementById('amount').value);
    if (!isNaN(amount) && amount > 0 && currentUser.balance >= amount) {
        currentUser.balance -= amount;
        updateBalance();
        localStorage.setItem('users', JSON.stringify(users));
        Swal.fire(`Achat de ${amount} € effectué avec succès.`);
        logTransaction(currentUser.username, 'Admin', amount, 'purchase');
    } else {
        Swal.fire('Montant invalide ou solde insuffisant.');
    }
}
