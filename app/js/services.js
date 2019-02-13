'use strict';

/* Services */

angular.module('myApp.services', [])
.factory('backend', ['Base64', '$cookieStore', '$http', '$q', function (Base64, $cookieStore, $http, $q) {

    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookieStore.get('authdata');

    var SERVER_URL = "http://localhost:10000";

    function checkResponse(response) {
        if(response.status == 401)
            console.error("Invalid username or password!");
    }

    function getUserFromCookie(){
        var data = $cookieStore.get('authdata');
        if(data) 
            return Base64.decode(data).split(":")[0];
        else
            return null;
    }

    return {
        getReport: function(report) {
            if(typeof this.reportCanceler != 'undefined')
                this.reportCanceler.resolve();

            this.reportCanceler = $q.defer();

            let url = `${SERVER_URL}/getReport/${report}`;

            return $http.get(url, {timeout: this.reportCanceler.promise})
                        .then(function(result) {
                            return result.data;
                        }, function(response){
                            checkResponse(response);
                            return $q.reject(response);
                        }
            );
        },
        getEncounter: function(encounter, model="current") {
            if(typeof this.encounterCanceler != 'undefined')
                this.encounterCanceler.resolve();

            this.encounterCanceler = $q.defer();
            
            let url1 = `${SERVER_URL}/getEncounter/${encounter}`;
            let url2 = `${SERVER_URL}/getPredictions/encounter/${encounter}/${model}`;

            return $q.all([$http.get(url1,{timeout: this.encounterCanceler.promise}),
                $http.get(url2,{timeout: this.encounterCanceler.promise})])
                .then(function(results){
                        return Object.assign(results[0].data, results[1].data);
                        // console.log({...results[0].data, ...results[1].data});
                    }, 
                    function (error){
                        checkResponse(error);
                        return $q.reject(error);
                    }
            );
        },
        logout: function () {
            document.execCommand("ClearAuthenticationCache");
            $cookieStore.remove('authdata');
            $http.defaults.headers.common.Authorization = 'Basic ';
            localStorage.clear();
        },
        login: function(username, password) {            
            var encoded = Base64.encode(username + ':' + password);
            $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
            $cookieStore.put('authdata', encoded);
        },
        checkLogin: function() {            
            return $http.get(`${SERVER_URL}/login/`)
                        .then(function(result) {
                            return result.data;
                        }
            );
        },
        getUserName: function(){
            return getUserFromCookie()
        },
        putLogEvent: function(event_name, message){
            let uri = `${SERVER_URL}/logEvent/`;
            console.log(event_name, message);
            return $http.put(uri + event_name, message);
        },
        // getAnnotationUrls: function(report) {
        //     return {
        //         create: `${SERVER_URL}/annotator/create/${report}`,
        //         update: `${SERVER_URL}/annotator/update/:id`,
        //         destroy: `${SERVER_URL}/annotator/destroy/:id`,
        //         read: `${SERVER_URL}/annotator/read/${report}`,
        //         search: `${SERVER_URL}/annotator/read/${report}`
        //     }
        // },
        putFeedback: function(feedbackList, model, override) {
            var uri = `${SERVER_URL}/putFeedback/`;

            return $http.put(uri + model + "/" + override, 
                            JSON.stringify(feedbackList))
                        .then(function(result) {
                            return result.data;
                        }, function(response){
                            checkResponse(response);
                            return $q.reject(response);
                        }
            );
        },

        getEncounterList: function(){
            return $http.get('encounter-select/encounters.json').then(function(result) {
                return result.data;
            });
        },

        getAnnotationMap: function(){
            return $http.get('encounter-select/map_annot.json').then(function(result) {
                return result.data;
            });
        }
    };
}])

//http://wemadeyoulook.at/en/blog/implementing-basic-http-authentication-http-requests-angular/
.factory('Base64', function() {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
        'QRSTUVWXYZabcdef' +
        'ghijklmnopqrstuv' +
        'wxyz0123456789+/' +
        '=';
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
 
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
 
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
 
                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);
 
            return output;
        },
 
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));
 
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
 
                output = output + String.fromCharCode(chr1);
 
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
 
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
 
            } while (i < input.length);
 
            return output;
        }
    };
});
