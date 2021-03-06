import { ExcludePipe } from '../pipes/exclude.pipe';
import { ListPipe } from '../pipes/list.pipe';
import { SortByPropPipe } from '../pipes/sortByProp.pipe';
import possibleStatuses from './statusMessage.model';

export class Project {

    public data;
    public key;
    public lastStatus: Object;

    constructor(project: any) {
        this.key = project['$key'];
        delete project['$key'];
        delete project['$exists'];
        this.data = project;
    }

    getAnnotations() {
        return this.data.annotations;
    }

    getAnnotationsByType(type:string){
        let collection = {};

        if(this.data.hasOwnProperty('annotations') && this.data.annotations !== null && this.data.annotations !== undefined){
        let annotations = this.data.annotations;
        Object.keys(annotations).forEach( key =>{
            let obj = annotations[key];
            if( obj['data']['type'] === type) collection[key] = obj;
        });
        }
        
        return Object.keys(collection).length === 0 ? false : collection;
    }

    getSortedAnnoKey(sortVal) {

        // sorted by end-value: optional parms: '' (returns default first) or 'last'
        let returnVal;
        let filteredAnnoArray = new ExcludePipe().transform(this.data['annotations'], 'outro');
        filteredAnnoArray = new ExcludePipe().transform(filteredAnnoArray, 'logo');

        if (this.data.hasOwnProperty('annotations') && Object.keys(filteredAnnoArray).length > 0) { // there's annotations available

            let arIndex;
            let annoArray = new ListPipe().transform(filteredAnnoArray);
            let annoSorted = new SortByPropPipe().transform(annoArray, 'end');

            (sortVal === 'last') ? arIndex = annoSorted.length - 1 : arIndex = 0;

            returnVal = annoSorted[arIndex]['key'];
        } else {
            returnVal = null;
        }

        return returnVal;
    }

    addOutro(key, template) {
        if(!template) return; 
    
        if( this.data.clip && this.data.clip['movieLength']) {
            // create annotation object if none
            if (!this.data['annotations']) this.data['annotations'] = {};

            let strtTm = this.data['clip']['movieLength'] - template.transitionDuration;
            let endTm = this.data['clip']['movieLength'] - template.transitionDuration + template.duration;

            let newAnno = { key: key, start: strtTm, end: endTm, data: template, };

            this.updateAnnotation(key, newAnno);

            return newAnno;
        }
        return null;
    }

    setOutro(obj): string{
        // delete existing outro
        const oldKey = this.getAnnoKeyOfType('outro');
        if(oldKey) delete this.data['annotations'][`${oldKey}`];

        // create annotation object if it doesnt exist
        if (!this.data['annotations']) this.data['annotations'] = {};

        // add new outro
        const newKey = this.makeKey();
        this.addOutro(newKey, obj);

        return newKey;
    }

    addLogo(key, template){
        if(!template) return; 

        if( this.data.clip && this.data.clip['movieLength']) {
            if (!this.data['annotations']) this.data['annotations'] = {};

            let strtTm = 3;
            let endTm = this.data['clip']['movieLength'];

            let newAnno = { key: key, start: strtTm, end: endTm, data: template, };

            this.updateAnnotation(key, newAnno);

            return newAnno;
        }        
        return null;
    }

    setLogo(obj): string{
        // delete existing logo
        const oldKey = this.getAnnoKeyOfType('logo');
        if(oldKey) delete this.data['annotations'][`${oldKey}`];

        // create annotation object if it doesnt exist
        if (!this.data['annotations']) this.data['annotations'] = {};

        // add new outro
        const newKey = this.makeKey();
        this.addLogo(newKey, obj);

        return newKey;
    } 

    getAnnoKeyOfType(type){
        if( this.data.annotations ) {
            for(let i in this.data.annotations){
                if ( this.data.annotations[i]['data']['type'] === type){
                    return this.data.annotations[i]['key'];
                }
            }
        }
        return false;
    }

    addAnnotation(template) {
        // check if a template is properly passed
        if(template === undefined) return; 

        // create annotation object if none
        if (!this.data['annotations']) this.data['annotations'] = {};

        let newKey = this.makeKey();

        // ADD new annotation
        let strtTm = 0;
        let spanTm = 4; // default spanTm if none provided

        let filteredAnnoArray = new ExcludePipe().transform(this.data['annotations'], 'outro');
        filteredAnnoArray = new ExcludePipe().transform(filteredAnnoArray, 'logo');

        if (template.duration) { spanTm = template.duration; }

        // if min one annotation
        if ( Object.keys(filteredAnnoArray).length > 0) {
            // object to array => sort => get one with highest end-value
            let annoArray = new ListPipe().transform(filteredAnnoArray);
            let annoSorted = new SortByPropPipe().transform(annoArray, 'end');
            let annoLastEndtime = annoSorted[annoSorted.length - 1]['end'];

            strtTm = annoLastEndtime;
            const leftTm = this.data['clip']['movieLength'] - strtTm;

            if (leftTm <= spanTm) {
                strtTm = this.data['clip']['movieLength'] - spanTm;
            }
        }

        let endTm = strtTm + spanTm;
        let newAnno = {
            key: newKey,
            start: strtTm,
            end: endTm,
            data: template,
        };
        
        this.updateAnnotation(newKey, newAnno);

        return newAnno;
    }

    getAnnotation(key) {
        return this.data.hasOwnProperty('annotations') ? this.data['annotations'][`${key}`] : null;
    }
    
    updateAnnotation(key, obj) {
        // update project | if key doesn't exist, its created
        this.data['annotations'][`${key}`] = obj;
    }

    get created() {
        var date = new Date(this.data['created']);
        return `${date.getHours()}:${date.getMinutes()} ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
    }

    get createdBy() {
        return this.data.createdBy;
    }

    get hasBumper() {
        // returns transitionDuration of bumper if true 
        if (this.data.annotations) {
            let hasBumper = false;
            let annotations = Object.keys(this.data.annotations);
            // update flag with transitionDuration
            for (let i in annotations) {
                if (this.data.annotations[annotations[i]].data.type === 'bumper') {
                    hasBumper = this.data.annotations[annotations[i]].data.transitionDuration;
                }
            }
            return hasBumper
        }
    }

    remapAnnotationsTime() {
        // check annotation-end-time against maximum allowed endtime(annoMaxEnd)
        // returns true if annotations-time(s) are changed  
        if (this.data.annotations) {

            let updateProjectFlag = false;
            let annotations = Object.keys(this.data.annotations);

            for (let i in annotations) {
                let annoEnd = this.data.annotations[annotations[i]].end;
                let annoStart = this.data.annotations[annotations[i]].start;
                let annoSpan = annoEnd - annoStart;

                let annoMaxEnd = this.data.clip.movieLength
                if (this.hasBumper) { let annoMaxEnd = this.hasBumper }

                if (annoEnd > annoMaxEnd) {
                    // IF OUTRO
                    // if( this.data.annotations[annotations[i]].data.type === 'outro' ){
                    //     let bumpTransDur = this.data.annotations[annotations[i]].transitionDuration;
                    //     let bumpDuration = this.data.annotations[annotations[i]].durations;
                    //     this.data.annotations[annotations[i]].start = this.data.clip.movieLength - bumpTransDur;
                    //     this.data.annotations[annotations[i]].end = this.data.annotations[annotations[i]].start + bumpDuration;

                    //     updateProjectFlag = true;
                    //     return
                    // }

                    // shift annotation from annoMaxEnd
                    this.data.annotations[annotations[i]].end = annoMaxEnd;
                    this.data.annotations[annotations[i]].start = annoMaxEnd - annoSpan;

                    updateProjectFlag = true;
                }
            }
            return updateProjectFlag;
        }
    }

    isRendering() {
        return (this.data.hasOwnProperty('status') && this.data.status.hasOwnProperty('rendering'))
    }

    hasAnnotations() { 
        const arrSubKeys = Object.keys(this.getAnnotationsByType('subtitle'));
        const arrOverlayKeys = Object.keys(this.getAnnotationsByType('overlay'));
        return arrSubKeys.concat(arrOverlayKeys).length > 0;
    }

    private checkStatus(status: Object) {
        return (this.data.hasOwnProperty('status') && this.data.status[status['label']]) ? true : false;

    }

    private getLastObject(obj) {
        return obj[Object.keys(obj)[Object.keys(obj).length - 1]];
    }

    private makeKey() {
        return `-ANNO${Math.random().toString(22).substr(2, 15).toUpperCase()}`;
    }

}