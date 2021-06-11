// Listen to all click events on the document
document.addEventListener('click', function (event) {

	// If the clicked element does not have and is not contained by an element with the .open-in-browser class, ignore it
	if (!event.target.closest('.open-in-browser')) return;

	// Otherwise, open the link in the default browser...
    event.preventDefault();
    let address = event.target.closest('a').getAttribute('href');
    window.api.shell.openExternal(address);

});