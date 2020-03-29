function getPrefix(service) {
  if (service == 'filmweb')  return 'f';
  else if (service == 'netflix')  return 'n';
  else if (service == 'hbogo') return 'h';
}

function removeSpecialChars(data) {
	// TODO: (optional) PL chars and another to ENG
	if ( data === undefined) {
		return undefined;
		
	} else if ( Array.isArray(data) ) {
		data.forEach((val, key) => { data[key] = removeSpecialChars(val) })  
		return data;

	} else return data.replace("&nbsp;"," ").replace(/[^\w\sĄąĆćĘęŁłŃńÓóŚśŹźŻż]/gi, '').replace(/\s\s+/g, ' ').toLowerCase();
	
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
