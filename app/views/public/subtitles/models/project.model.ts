import { ListPipe } from '../../../../common/pipes/list.pipe';
import { SortByPropPipe } from '../../../../common/pipes/sortByProp.pipe';
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

        this.getLastStatus();
    }
    
    getAnnotations() {
        return this.data.annotations;
    }

    getFirstAnnotationKey() {
      let returnVal;

      if (this.data.hasOwnProperty('annotations')) { // there's annotations available
        const arrKeys = Object.keys(this.data.annotations);
        returnVal = arrKeys[0];
      } else {
        returnVal = null;
      }

      return returnVal;
    }

    addBumper(template) {
        
        let newId = this.makeid();
        
        console.log('tempalate is bumper')

        // IF BUMPER add bumper to end
        
        let strtTm = this.data['clip']['movieLength'] - template.transitionDuration;
        let endTm = this.data['clip']['movieLength'] - template.transitionDuration + template.duration;

        console.log('strtTm', strtTm)
        console.log('endTm', endTm)

        let newAnno = {
            key: newId,
            start: strtTm,
            end: endTm,
            data: template,
        };
        this.data['annotations'][newId] = newAnno;

        return newAnno;
    }

    addAnnotation(template) {

        // create annotation object if none
        if (!this.data['annotations']) {
            this.data['annotations'] = {};
        }

        if (template.name === 'bumper') {
            return this.addBumper(template);
        }
        let newId = this.makeid();

        // ADD new annotation
        let strtTm = 0;
        let spanTm = 4; // default spanTm if none provided
        if (template.duration) { spanTm = template.duration; }

        // if min one annotation
        if (Object.keys(this.data['annotations']).length > 0) {
            // object to array => sort => get one with highest end-value
            let annoArray = new ListPipe().transform(this.data['annotations']);
            let annoSorted = new SortByPropPipe().transform(annoArray, 'end');
            let annoLastEndtime = annoSorted[annoSorted.length -1 ]['end'];
            
            strtTm = annoLastEndtime;
            const leftTm = this.data['clip']['movieLength'] - strtTm;

            if (leftTm <= spanTm) {
                strtTm = this.data['clip']['movieLength'] - spanTm;
            }
        }
        
        let endTm = strtTm + spanTm;
        let newAnno = {
            key: newId,
            start: strtTm,
            end: endTm,
            data: template,
        };
        
        this.data['annotations'][newId] = newAnno;

        return newAnno;
    }

    getAnnotation(key) {
        return this.data.hasOwnProperty('annotations') ? this.data['annotations'][`${key}`] : null;
    }

    updateSelectedAnno(key, obj) {
        // update project | if key doesn't exists, its created this way
        this.data['annotations'][`${key}`] = obj;
    }

    getLastStatus() {
        for(let i=0; i< possibleStatuses.length; i++) {
            const status = possibleStatuses[i];
            if(this.checkStatus(status)) {
              if(status['label'] === 'stitchingProgress') status['message']['progress'] = this.data.status['stitchingProgress'];
              if(status['label'] === 'downScaleProgress') status['message']['progress'] = this.data.status['downScaleProgress'];
              this.lastStatus = status['message']
            }
        } 
    }
    
    get hasBumper() {
        // returns transitionDuration of bumper if true 
        if(this.data.annotations) {
            let hasBumper = false;
            let annotations = Object.keys(this.data.annotations);
            // update flag with transitionDuration
            for( let i in annotations ) {
                if( this.data.annotations[annotations[i]].data.type === 'bumper' ) { 
                    hasBumper = this.data.annotations[annotations[i]].data.transitionDuration;
                }
            }
            return hasBumper
        }
    }
    
    remapAnnotationsTime() {
        // check annotation-end-time against maximum allowed endtime(annoMaxEnd)
        // returns true if annotations-time(s) are changed  
        if( this.data.annotations) {

            let updateProjectFlag = false;
            let annotations = Object.keys(this.data.annotations);

            for (let i in annotations) {
                let annoEnd = this.data.annotations[annotations[i]].end;
                let annoStart = this.data.annotations[annotations[i]].start;
                let annoSpan = annoEnd - annoStart;

                let annoMaxEnd =  this.data.clip.movieLength
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

    private checkStatus(status: Object) { 
        return (this.data.hasOwnProperty('status') && this.data.status[status['label']]) ? true : false;

    }

    private getLastObject(obj) {
        return obj[Object.keys(obj)[Object.keys(obj).length - 1]];
    }

    private makeid() {
        return `-ANNO${Math.random().toString(22).substr(2, 15).toUpperCase()}`;
    }
    
}