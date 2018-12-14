angular.module('highlightedReport.directive', [])
.directive('highlightedReport', ['backend', function(backend) {
    return {
        restrict: 'E',
        scope: {
            data: '<',
            recordId: '<',
            helperTerms: '<',
            getPositives: '&'
            // redrawMap: '='
        },
        link: function (scope, element, attrs) {

                scope.highlightTerms = function() {

                    if(!scope.data)
                        return

                    //this needs to be done first as it is position sensitive
                    levels = scope.getPositives({r_id: scope.recordId});


                    if (levels.sentences.length == 0 && 
                        levels.sections.length == 0){

                        element.text(scope.data.replace(/</g,' &lt; ')
                                    .replace(/>/g,' &gt; '));
                    }
                    else{
                        let charArray = scope.data.split('');

                        for(let i=0;i<charArray.length;i++){
                            if (charArray[i] == '<')
                                charArray[i] = ' &lt;';
                            else if(charArray[i] == '<')
                                charArray[i] = ' &gt;';
                        }

                        for (sent of levels.sentences){
                            let index = sent.start;
                            while(charArray[index].trim() == '')
                                index++;
                            charArray[index] = `<span class="sentence-incidental" id="sentence-${sent.sentence_id}" scroll-bookmark="sentence-${sent.sentence_id}">` + charArray[index];
                            
                            index = sent.end - 1;
                            while(charArray[index].trim() == '')
                                index--;
                            charArray[index] = '</span>' + charArray[index];
                        }

                        for (sect of levels.sections){
                            let index = sect.start;
                            while(charArray[index].trim() == '')
                                index++;
                            charArray[index] = `<span class="section-incidental" id="section-${sect.section_id}" scroll-bookmark="section-${sect.section_id}">` + charArray[index];
                            
                            index = sect.end - 1;
                            while(charArray[index].trim() == '')
                                index--;
                            charArray[index] = '</span>' + charArray[index];
                        }
                    
                        element.text(charArray.join(''));
                    }

                    $(element).highlight(/S_O_H[\s\S]*E_O_H/, "dim") // header
                        .highlight(/De-ID.*reserved./i, "dim") //copright
                        .highlight(/\[Report de-identified.*/i, "dim") //De-ID
                        .highlight(/\*\* Report Electronically Signed Out \*\*/, "dim") //Pathology template
                        .highlight(/My signature is attestation[\s\S]*reflects that evaluation./, "dim") //Pathology template
                        .highlight(/E_O_R/, "dim") //End of report


                    $(element).highlight(/[a-zA-Z\-\ #]*\:/g, "bold") //Colon fields
                            .highlight(/\*\*[a-zA-Z\ ,-\[\]\.]*/g, "dim"); //DE-IDed Names

                    //annotation-helper
                    scope.helperTerms.forEach( function(keyword) {
                        // console.log(new RegExp("\\b"+keyword+"\\b","gi"))
                        $(element).highlight(new RegExp(keyword,"gi"), "annotation-helper", "annotation-helper-" + keyword);
                    });


                    // //For line numbers
                    // element.html('<code>' + element.html()
                    //                 .split('\n')
                    //                 .join(' </code>\n<code>') + '</code>');


                    //Initialize annotator
                    var options = {};
                    
                    scope.annotator = angular.element(element).annotator(options).data('annotator');

                    scope.annotator.addPlugin('Categories', {
                        incidental: 'annotator-hl-yellow',
                        mechanism: 'annotator-hl-green',
                        todo: 'annotator-hl-red',
                        injuries: 'annotator-hl-blue',
                        operative: 'annotator-hl-purple',
                        intervention: 'annotator-hl-orange'
                    });

                    // console.log(backend.getAnnotationBackend());

                    scope.annotator.addPlugin('Store', {
                        // The endpoint of the store on your server.
                        prefix: "",
                        urls: backend.getAnnotationUrls(scope.recordId)
                    });

                    // annotator.addPlugin('Tags', {
                    //     // // The endpoint of the store on your server.
                    //     // prefix: "",
                    //     // urls: backend.getAnnotationUrls(scope.recordId)
                    // });

                    //HACK: We don't know when the annotations finish loading
                    // setTimeout(function(){
                    //     scope.redrawMap();
                    // }, 5000)

                    // scope.redrawMap();

                };
        
                scope.$watchGroup(['data', 'helperTerms.length'], function(){
                    if(scope.annotator)
                        scope.annotator.destroy();
                    scope.highlightTerms();
                    // console.log("Directive redrawn!");
                }, true);
        }
    };
}])