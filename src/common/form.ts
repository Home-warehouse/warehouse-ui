import { UntypedFormGroup} from '@angular/forms';
const getFormAsDict = (form: UntypedFormGroup) => {
  let formDict: any = {};
  Object.keys(form.value).forEach(element => {
    const field = form.get(String(element));
    if (field){
      if(field.value !== null){
        formDict[String(element)] = field.value
      }
    }
  });
  return formDict;
}

export default getFormAsDict
