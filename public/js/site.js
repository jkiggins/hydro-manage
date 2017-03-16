function formErrorsByName(id, errs, classname) {
    var options = document.getElementById(id).getElementsByClassName(classname);

    for (i in options) {
        if (options[i].getAttribute !== undefined) {
            var name = options[i].getAttribute('name');
            console.log(name);
            if (errs.hasOwnProperty(name)) {
                options[i].setAttribute('placeholder', errs[name]);
                options[i].setAttribute('class', options[i].getAttribute('class') + ' uk-form-danger');
            }
        }
    }
}