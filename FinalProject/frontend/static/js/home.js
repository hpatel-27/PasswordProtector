import api from './APIClient.js';

const newGroupButton = document.querySelector('#new-group');
const newAccountButton = document.querySelector('.new-account-btn');
const delProviderButton = document.querySelector('.del-provider-btn');
const updateProviderButton = document.querySelector('.update-provider-btn');
const cardContainer = document.querySelector('.card-container');
const side = document.querySelector( '.sidebar' );

let outputProviders = [];
let outputAccounts = [];

let currentProvider = null;

// use the api to get the entire list of the providers for this user
api.getAllProviders().then( prv => {
    outputProviders.push(...prv);

    console.log( "providers ",  outputProviders);

    let first = 0;
    for ( let i = 0; i < outputProviders.length; i++ ) {
        const current = outputProviders[i];

        console.log( "provider", i , " ", current );

        // now that we have each provider for the current user
        // take their name and put it into the inner html for the button or a tag

        let prvCard = document.createElement( 'a' );
        prvCard.className = 'btn btn-primary prv-btn';
        prvCard.role = 'button';
        prvCard.innerHTML = current.name;        

        side.appendChild(prvCard);


        prvCard.addEventListener( 'click', (e) => {

            const siteButton = document.querySelector('.site-name-btn');

            siteButton.value = current.name;

            let providerId = current.id;
            currentProvider = providerId;

            displayAccounts( providerId );
        });

        // if we are in the first iteration fill out the info in the main section
        // for the first provider in the list
            // const siteButton = document.querySelector('.site-name-btn');

            // siteButton.value = current.name;
        let providerId = current.id;
        currentProvider = providerId;
        displayAccounts( providerId );


    }

    const siteButton = document.querySelector('.site-name-btn');

    if ( outputProviders.length > 0 ) {

        siteButton.value = outputProviders[first].name;
        let providerId = outputProviders[first].id;
        currentProvider = providerId;
        displayAccounts( providerId );
    }
    else {
        siteButton.value = '';
    }
});

let currentAccount = null;


window.addEventListener( 'DOMContentLoaded', (e) => {

    newGroupButton.addEventListener('click', (e) => {
        let prvCard = document.createElement( 'a' );
        prvCard.className = 'btn btn-primary prv-btn';
        prvCard.role = 'button';
        // prvCard.innerHTML = current.name;        

        let outsideAccessPrv = null;


        let prvName = prompt("Please enter the provider's name:", "Type here");
        if (prvName != null) {


            console.log("User input received: " + prvName);
            prvCard.innerHTML = prvName;

            api.createProvider( prvName ).then( provider => {
                side.appendChild(prvCard);

                console.log( "newly created provider ", provider );
                outsideAccessPrv = provider;
            })
            .catch((err) => {
                res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
            });

            prvCard.addEventListener( 'click', (e) => {

                updateProviderList();

                const siteButton = document.querySelector('.site-name-btn');


                siteButton.value = outsideAccessPrv.name;
                let providerId = outsideAccessPrv.id;
                currentProvider = providerId;
                console.log(" outsideaccsessname", outsideAccessPrv.name );
                console.log( "outsideaccessid", outsideAccessPrv.id );


                displayAccounts( providerId );
            });
            
        }
        else {
            console.log("User cancelled the prompt.");
        }

        

    });


    newAccountButton.addEventListener('click', (e) => {
        const card = document.createElement( 'div' );
        card.className = 'card';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
    
        const block1 = document.createElement('div');
        block1.className = 'card-block';

        const usernameLabel = document.createElement('p');
        usernameLabel.textContent = 'Username:';

        const usernameInput = document.createElement('input');
        usernameInput.setAttribute('type', 'text');
        usernameInput.setAttribute('name', 'mainUsername');
        usernameInput.className = 'input-username';

        block1.appendChild(usernameLabel);
        block1.appendChild( usernameInput);

        const passwordLabel = document.createElement('p');
        passwordLabel.textContent = 'Password:';

        const passwordInput = document.createElement('input');
        passwordInput.setAttribute('type', 'text');
        passwordInput.setAttribute('name', 'mainPassword');
        passwordInput.className = 'input-password';

        block1.appendChild(passwordLabel);
        block1.appendChild(passwordInput);


        const block2 = document.createElement('div');
        block2.className = 'card-block';

        const noteLabel = document.createElement('p');
        noteLabel.textContent = 'Notes:';

        const noteText = document.createElement('textarea');
        noteText.setAttribute('name', 'mainNotes');
        noteText.className = 'input-notes';

        block2.appendChild(noteLabel);
        block2.appendChild(noteText);
        
        const block3 = document.createElement('div');
        block3.className = 'card-block btn-block';

        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.setAttribute( 'type', 'submit' );
        saveBtn.setAttribute( 'variant', 'primary' );
        saveBtn.innerHTML = 'Save Account';

        const delBtn = document.createElement('button');
        delBtn.className = 'save-btn';
        delBtn.setAttribute( 'variant', 'primary' );
        delBtn.innerHTML = 'Delete Account';

        block3.appendChild( saveBtn );
        block3.appendChild( delBtn );

        cardBody.appendChild(block1);
        cardBody.appendChild(block2);
        cardBody.appendChild(block3);

        card.appendChild(cardBody);

        cardContainer.appendChild(card);

        
        let clicks = 0;
        currentAccount = null;

        saveBtn.addEventListener( 'click', (e) => {


            console.log( 'clicked the save button' );

            let usrname = usernameInput.value;
            let passwrd = passwordInput.value;
            let ntes = noteText.value;

            // normally if the user has not clicked any of the groups so far, it is defaulted to the first provider in the user's list
            // to even be able to click the save button, you have to click one of the provider buttons, or you are still on the first provider
            if ( currentProvider != null && clicks == 0 ) {
                clicks++;
                api.createAccount( currentProvider, usrname, passwrd, ntes ).then( account => {
                    console.log( " the newly created account " , account );
                    currentAccount = account;
                })
                .catch( err => {
                    console.log( "Error ", err );
                });
            }
            // make sure we use the create endpoint for the first time POST, but need to PUT for the update operation
            else {
                api.updateAccount( currentProvider, currentAccount.id, usrname, passwrd, ntes ).then( account => {
                    console.log( " the newly updated account " , account );
                    currentAccount = account;
                })
                .catch( err => {
                    console.log( "Error ", err );
                });
            }
        });


        delBtn.addEventListener( 'click', (e) => {


            console.log( 'clicked the delete button' );

            let usrname = usernameInput.value;
            let passwrd = passwordInput.value;
            let ntes = noteText.value;

            if ( currentAccount != null && currentAccount.id != null ) {

                api.deleteAccount( currentProvider, currentAccount.id ).then( account => {
                    console.log( " the newly deleted account " , account );
                    currentAccount = account;
                })
                .catch( err => {
                    console.log( "Error ", err );
                });
            }


            setTimeout( function() {
                displayAccounts(currentProvider);
            }, 100);
        });

        
    });


    delProviderButton.addEventListener('click', (e) => {

        // if they delete a provider, delete all the accounts too 

        // the currentProvider variable stores the providerID
        api.deleteProvider(currentProvider);
        console.log( "deleted provider ", currentProvider );


        setTimeout( function() {
            updateSidebar(true);
        }, 100);
        

    });

    updateProviderButton.addEventListener('click', (e) => {
        const siteButton = document.querySelector('.site-name-btn');

        // the value of the siteButton is the thing we want to update the value of the provider name in the system to be
        api.editProviderName(siteButton.value, currentProvider).then( newPrv => {
            console.log( "new provider with the updated name " , newPrv );
        });

        setTimeout( function() {
            updateSidebar(false);
        }, 100);
    });

});



// have an extra function to display all the accounts of a provider

function displayAccounts( providerId ) {
    api.getAccounts( providerId ).then( accounts => {
        // reset the accounts array so that we aren't just pushing the new accounts onto the list with other accounts from another provider
        outputAccounts = []

        // remove all the other children of the card container
        cardContainer.innerHTML = '';

        // now we have all the accounts for the provider they wanted us to deal with

        outputAccounts.push(...accounts );

        console.log( "accounts ", outputAccounts );


        for ( let i = 0; i < outputAccounts.length; i++ ) {

            let acc = outputAccounts[i];

            const card = document.createElement( 'div' );
            card.className = 'card';

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
        
            const block1 = document.createElement('div');
            block1.className = 'card-block';

            const usernameLabel = document.createElement('p');
            usernameLabel.textContent = 'Username:';

            const usernameInput = document.createElement('input');
            usernameInput.setAttribute('type', 'text');
            usernameInput.setAttribute('name', 'mainUsername');
            usernameInput.className = 'input-username';
            usernameInput.value = acc.username;

            block1.appendChild(usernameLabel);
            block1.appendChild( usernameInput);

            const passwordLabel = document.createElement('p');
            passwordLabel.textContent = 'Password:';

            const passwordInput = document.createElement('input');
            passwordInput.setAttribute('type', 'text');
            passwordInput.setAttribute('name', 'mainPassword');
            passwordInput.className = 'input-password';
            passwordInput.value = acc.password;

            block1.appendChild(passwordLabel);
            block1.appendChild(passwordInput);


            const block2 = document.createElement('div');
            block2.className = 'card-block';

            const noteLabel = document.createElement('p');
            noteLabel.textContent = 'Notes:';

            const noteText = document.createElement('textarea');
            noteText.setAttribute('name', 'mainNotes');
            noteText.className = 'input-notes';
            noteText.value = acc.notes;


            block2.appendChild(noteLabel);
            block2.appendChild(noteText);


                    
            const block3 = document.createElement('div');
            block3.className = 'card-block';

            const saveBtn = document.createElement('button');
            saveBtn.className = 'save-btn';
            saveBtn.setAttribute( 'variant', 'primary' );
            saveBtn.innerHTML = 'Save Account';

            const delBtn = document.createElement('button');
            delBtn.className = 'save-btn';
            delBtn.setAttribute( 'variant', 'primary' );
            delBtn.innerHTML = 'Delete Account';

            block3.appendChild( saveBtn );
            block3.appendChild( delBtn );


            cardBody.appendChild(block1);
            cardBody.appendChild(block2);
            cardBody.appendChild(block3);

            card.appendChild(cardBody);

            cardContainer.appendChild(card);


            currentAccount = acc;


            saveBtn.addEventListener( 'click', (e) => {
                console.log( 'clicked the save button' );

                let usrname = usernameInput.value;
                let passwrd = passwordInput.value;
                let ntes = noteText.value;

                api.updateAccount( currentProvider, acc.id, usrname, passwrd, ntes ).then( account => {
                    console.log( " the updated account " , account );
                    currentAccount = acc;

                })
                .catch( err => {
                    console.log( "Error ", err );
                });
            });


            delBtn.addEventListener( 'click', (e) => {


                console.log( 'clicked the delete button' );
    
                let usrname = usernameInput.value;
                let passwrd = passwordInput.value;
                let ntes = noteText.value;
    
                if ( currentAccount != null && currentAccount.id != null ) {
    
                    api.deleteAccount( currentProvider, currentAccount.id ).then( account => {
                        console.log( " the newly deleted account " , account );
                        currentAccount = acc;
                    })
                    .catch( err => {
                        console.log( "Error ", err );
                    });
                }
    
    
                setTimeout( function() {
                    displayAccounts(currentProvider);
                }, 100);
            });

        }

    });
}

async function updateProviderList() {
    await api.getAllProviders().then( providers => {

        console.log( "providers in the api call " , providers );
        outputProviders = [];
        outputProviders.push(...providers);


    })
    .catch((err) => {
        console.log(  err );
    });

    return outputProviders;
}

async function updateSidebar( flag ) {
    api.getAllProviders().then( providers => {
        outputProviders = [];
        outputProviders.push(...providers);

        side.innerHTML = '';

        for ( let i = 0; i < outputProviders.length; i++ ) {
            const current = outputProviders[i];
    
            console.log( "provider", i , " ", current );
    
            // now that we have each provider for the current user
            // take their name and put it into the inner html for the button or a tag
    
            let prvCard = document.createElement( 'a' );
            prvCard.className = 'btn btn-primary prv-btn';
            prvCard.role = 'button';
            prvCard.innerHTML = current.name;        
    
            side.appendChild(prvCard);
    
    
            prvCard.addEventListener( 'click', (e) => {
    
                const siteButton = document.querySelector('.site-name-btn');
    
                siteButton.value = current.name;
    
                let providerId = current.id;
                currentProvider = providerId;
    
                displayAccounts( providerId );
            });
    
            // if we are in the first iteration fill out the info in the main section
            // for the first provider in the list
        }

        if ( flag ) {
            const siteButton = document.querySelector('.site-name-btn');

            siteButton.value = outputProviders[0].name;
            let providerId = outputProviders[0].id;
            currentProvider = providerId;
            displayAccounts( providerId );
        }

        if ( outputProviders.length == 0 ) {
            const siteButton = document.querySelector('.site-name-btn');
    
            siteButton.value = '';
        }
    });
}