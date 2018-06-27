(function() {
	var localeBundles = [
		'/usr/share/javascript/ilib/localedata/' + navigator.language + '.js',
		'localedata/' + navigator.language + '.js'
	];
	for(var i=0; i<localeBundles.length; i++) {
		var script= document.createElement('script');
		script.type = 'text/javascript';
		script.src = localeBundles[i];
		script.async = false;
		document.head.appendChild(script);
	}
})();
