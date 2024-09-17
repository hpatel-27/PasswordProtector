import api from './APIClient.js';

api.getCurrentUser().then(user => {
  let link = document.createElement('a');
  link.href = '#';
  link.innerHTML = "Log Out";
  link.addEventListener("click", e => {
    e.preventDefault();
    api.logOut().then(() => {
      document.location = "./login";
    });
  })

})
.catch(error => {
  if(error.status === 401) {
    console.log("We are not logged in");
    document.location = './login';
  }
  else {
    console.log(`${error.status}`, error);
  }
});

// function registerServiceWorker() {
//   if (!navigator.serviceWorker) { // Are SWs supported?
//     return;
//   }

//   navigator.serviceWorker.register('/serviceWorker.js')
//     .then(registration => {
//       /*if (!navigator.serviceWorker.controller) {
//         //Our page is not yet controlled by anything. It's our first SW
//         return;
//       }*/

//       if (registration.installing) {
//         console.log('Service worker installing');
//       } else if (registration.waiting) {
//         console.log('Service worker installed, but waiting');
//         newServiceWorkerReady(registration.waiting);
//       } else if (registration.active) {
//         console.log('Service worker active');
//       }

//       registration.addEventListener('updatefound', () => { //This is fired whenever registration.installing gets a new worker
        
//         console.log("SW update found", registration, navigator.serviceWorker.controller);
//         newServiceWorkerReady(registration.installing);
//       });
//     })
//     .catch(error => {
//       console.error(`Registration failed with error: ${error}`);
//     });

//   navigator.serviceWorker.addEventListener('message', event => {
//     console.log('SW message', event.data);
//   });

//   // Ensure refresh is only called once.
//   // This works around a bug in "force update on reload" in dev tools.
//   let refreshing = false;
//   navigator.serviceWorker.addEventListener('controllerchange', () => {
//     if(refreshing) return;
//     window.location.reload();
//     refreshing = true;
//   });

// };

// registerServiceWorker();


// //This method is used to notify the user of a new version
// function newServiceWorkerReady(worker) {
//   const popup =  document.createElement('div');
//   popup.className = "popup";
//   popup.innerHTML = '<div>New Version Available</div>';

//   const buttonOk = document.createElement('button');
//   buttonOk.innerHTML = 'Update';
//   buttonOk.addEventListener('click', e => {
//     worker.postMessage({action: 'skipWaiting'});
//   });
//   popup.appendChild(buttonOk);

//   const buttonCancel = document.createElement('button');
//   buttonCancel.innerHTML = 'Dismiss';
//   buttonCancel.addEventListener('click', e => {
//     document.body.removeChild(popup);
//   });
//   popup.appendChild(buttonCancel);

//   document.body.appendChild(popup);
// }