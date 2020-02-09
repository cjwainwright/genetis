module.exports = function updateContent(element, value) {
    if(element.hasAttribute('content')) {
        element.setAttribute('content', value);
    } else {
        switch(element.nodeName) {
            case 'AUDIO':
            case 'EMBED':
            case 'IFRAME':
            case 'IMG':
            case 'SCRIPT':
            case 'SOURCE':
            case 'TRACK':
            case 'VIDEO':
                element.setAttribute('src', value);
                break;

            case 'A':
            case 'AREA':
            case 'LINK':
                element.setAttribute('href', value);
                break;

            case 'OBJECT':
                element.setAttribute('data', value);
                break;
                                    
            case 'TIME':
                element.setAttribute('datetime', value);
                element.textContent = value; // TODO - format for display
                break;
                
            case 'METER':
            case 'DATA':
                element.setAttribute('value', value);
                element.textContent = value; // TODO - format for display
                break;
                
            default:
                element.textContent = value;
                break;
        }
    }
};