// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
//  apiUrl: 'http://sarge2.ro4r.no',
  apiUrl: 'http://localhost:5000',
  kovaApiUrl: 'https://api.kova.no',
//  kovaApiUrl: 'http://localhost:5001',
  fireBase: {
    apiKey: 'AIzaSyClG4XsgFDTcrDhBlSAtGy9RkrS2dCUDc4',
    authDomain: 'sarge2-41ef7.firebaseapp.com',
    databaseURL: 'https://sarge2-41ef7.firebaseio.com',
    projectId: 'sarge2-41ef7',
    storageBucket: '',
    messagingSenderId: '1091128158107'
  }
};
