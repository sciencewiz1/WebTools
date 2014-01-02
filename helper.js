//Helper functions.

//Parses value as int if it is an int. If not it
//returns 0.
function GetValue(value)
{
    var n = parseInt(value);
	
    return n == null || isNaN(n) ? 0 : n;
}