const config = require('./config');
const manifest = require('./manifest');
import axios from 'axios';


export const generateForm = (formHtmlId=null, url = null, apiVersion = null, productId = null, passKey = null ) => {
    let apiV = apiVersion ? apiVersion : config.ApiVersion;
    let pKey = apiVersion ? passKey : config.PassKey;
    let pId = productId ? productId : config.ProductId;
    let sUrl = url ? url : config.SubmitUrl;

    let actualUrl = `${sUrl}?ApiVersion=${apiV}&ProductId=${pId}&PassKey=${pKey}`;

    axios.get(actualUrl, {}).then(( res ) => {
        console.log("the res data is" , res.data);
        var formHtml = getManifest(res.data);
        console.log("the manifest json", formHtml );
        if(formHtmlId) {
            document.getElementById(formHtmlId).innerHTML = formHtml
        }
    }).catch( (err) => {
        console.log("the error is" ,err);
    });
}

function getManifest(submit_response) {
    var htmlFull= '';
    console.log("the manifest is" , manifest);
    let html = '';
    let id = null;
    for (let i = 0; i < manifest.length; i++) {
        // get the ID and find in the response
        if (manifest[i].Type == 'Field') {
            id = manifest[i].Id;
            var label = manifest[i].Label;

            if (submit_response.Data.Fields) //error check to make sure it exists
            {
                html = renderField(id, submit_response);
                htmlFull += html;
            } else {
                console.log('could not find node');
            }
        } else if (manifest[i].Type == 'Group') {
            //handle the GROUP elements
            id = manifest[i].Id;
            html = renderGroup(id, submit_response); //call group function
            // Append to the form
            //$(html).appendTo( "#formContainer" );
            htmlFull += html;
        } else {
            console.log('not sure of the data type');
        }
    }
    return htmlFull;
}


function renderField(id, submit_response) {
    let field = submit_response.Data.Fields[id]; //have the field now.
    let type = field.Type;
    let html = '';
    switch (type) {
        case 'TextInput':
            html = textInput(field);
            break;
        case 'BooleanInput':
            html = booleanInput(field);
            break;
        case 'TextAreaInput':
            html = textAreaInput(field);
            break;
        case 'SelectInput':
            html = selectInput(field);
            break;
        case 'IntegerInput':
            html = integerInput(field);
            break;
        default:
            html = '';
            //handle this error
    }
    return html;
}

function renderGroup(id, submit_response) {
    var beginning = '<div class="groups_container">';
    var end = '</div>';
    let groupData = '';
    if (submit_response.Data.Groups[id].SubElements) {
        for (let k = 0; k < submit_response.Data.Groups[id].SubElements.length; k++) {
            groupData += renderField(submit_response.Data.Groups[id].SubElements[k].Id, submit_response);
        }
    }
    let html = beginning + groupData + end;
    return html;

}

function getLabel(field) {
    var label = '';
    if (field.Label === null) {
        //check the manifest to see if there is a label
        for (let m = 0; m < manifest.length; m++) {
            if (manifest[m].Id == field.Id) {
                label = manifest[m].Label;
                break;
            } else {
                label = '';
            }
        }
    } else { //not null
        label = field.Label;
    }
    return label;
}

function textInput(field) {
    var lab = getLabel(field);
    var text_snippet = '<div class="textInput ' + field.Id + '"><label for="' + field.Id + '">' + lab + '</label><input type = "text" id = "' + field.Id + '" value = "' + field.Default + '" /></div>';
    return text_snippet;
}

function booleanInput(field) {
    var lab = getLabel(field);
    var boolean_snippet = '<div class="booleanInput"><input type="checkbox" id="' + field.Id + ' "name="" value="" /><label for="' + field.Id + '">' + lab + '</label></div>';
    return boolean_snippet;
}

function textAreaInput(field) {
    var lab = getLabel(field);
    var textArea_snippet = '<div class="textInputArea' + field.Id + '"><label for="' + field.Id + '">' + lab + '</label><textarea name="textarea" id="' + field.Id + '" rows="10" cols="50">' + field.Default + '</textarea></div>';
    return textArea_snippet;
}

function selectInput(field) {
    var lab = getLabel(field);
    //loop through the options. 
    var optionsHtml = '';
    for (let j = 0; j < field.Options.length; j++) {
        optionsHtml += '<option value="' + field.Options[j].Value + '">' + field.Options[j].Label + '</option>';
    }
    var select_snippet = '<div class="selectInput"><label for="' + field.Id + '">' + lab + '</label><select name="' + field.Id + '">' + optionsHtml + '</select></div>';
    return select_snippet;
}

function integerInput(field) {
    var lab = getLabel(field);
    var integerHtml = '';
    if (field.Value == null) {
        field.Value = 5;
    }
    for (let n = 1; n <= field.Value; n++) {
        integerHtml += '<div class="star star_group_rating star_live"><a tabindex="' + n + '+" href="#" onclick="return false;" id="star_link_rating_' + n + '" name="" title="">' + n + '</a></div>';
    }
    var int_snippet = '<div class="star_group"><label for="star_group">Rating</label>' + integerHtml + '</div>';
    return int_snippet;
}
