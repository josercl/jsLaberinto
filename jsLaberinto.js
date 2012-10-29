//////////////////////////
/// VARIABLES GLOBALES ///
//////////////////////////

var TAMANO_CELDA=10;
var LINE_ATTR={"stroke": "black", "stroke-opacity": "2"};

var filas;
var cols;
var canvas;
var linea_resultado;

var interval_id;
var pausa=false;

///////////////////////////////////////////////////////////
/// Clase usada para representar casillas del laberinto ///
///////////////////////////////////////////////////////////

function Casilla(n){
	this.numero=n;
	this.izq=false;
	this.der=false;
	this.inf=false;
	this.sup=false;
	this.vecinos=new Array();
	this.padre=null;
}

Casilla.prototype.toString=function(){
	return this.numero;
}

////////////////////////////////////
/// Funciones extras de arreglos ///
////////////////////////////////////

Array.prototype.contiene=function(n){
	var existe=false;
    nn=this.length;
	for(i=0;i<nn;i++){
		existe=(this[i].numero == n.numero);
		if(existe){break;}
	}
	return existe;
}

Array.prototype.remove=function(n){
    nn=this.length;
	for(i=0;i<nn;i++){
		if(this[i].numero==n.numero){
            this.splice(i,1);
            break;
        }
	}
}

Array.prototype.shuffle=function(){
    o=this;
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

//////////////////////////
/// Funciones Gráficas ///
//////////////////////////

function limpiar(){
    filas=eval(document.getElementById("filas").value);
    cols=eval(document.getElementById("cols").value);
    document.getElementById("laberinto").innerHTML="";
    canvas=new Raphael("laberinto",TAMANO_CELDA*cols,TAMANO_CELDA*filas);
    linea_resultado=canvas.set();
}

function dibujar(nodos){

    limpiar();

	var N=filas*cols;    

	n=nodos.length;

	for(i=0;i<n;i++){		
		nodo=nodos[i];
		fila_nodo=Math.floor(nodo.numero/cols) * TAMANO_CELDA;
		col_nodo=(nodo.numero%cols) * TAMANO_CELDA;

        //canvas.text(col_nodo+TAMANO_CELDA/2,fila_nodo+TAMANO_CELDA/2,nodo.numero);

		if(!nodo.izq){
			canvas.path("M"+col_nodo+","+fila_nodo+" V"+(fila_nodo+TAMANO_CELDA)).attr(LINE_ATTR);
		}
		if(!nodo.sup){
			canvas.path("M"+col_nodo+","+fila_nodo+"H"+(col_nodo+TAMANO_CELDA)).attr(LINE_ATTR);
		}
	}

    canvas.rect(0,0,TAMANO_CELDA*cols,TAMANO_CELDA*filas).attr(LINE_ATTR);
}

function dibujarCamino(camino){
	pausa=false;
	clearInterval(interval_id);
	linea_resultado.remove();
	linea_resultado.clear();
	
	interval_id=setInterval(function(){
		if(!pausa){
			nodo=camino[0];
			fila_nodo=Math.floor(nodo.numero/cols) * TAMANO_CELDA;
			col_nodo=(nodo.numero%cols) * TAMANO_CELDA;
					
			var cuadrito=canvas.rect(col_nodo,fila_nodo,TAMANO_CELDA,TAMANO_CELDA).attr({
				"fill":"#00dd00","stroke-width":"0"
			}).toBack();
			
			linea_resultado.push(cuadrito);
			
			camino.splice(0,1);
			
			if(camino.length==0){
				clearInterval(interval_id);
			}
		}
	},30);	
}

//////////////////////////
/// Funciones de Grafo ///
//////////////////////////

function DFS(inicio,fin){
	var visitados=new Array();
	var porVisitar=new Array();
	var resultado=new Array();

	var nodoInicial=inicio; //Casilla inicial
	var nodoFinal=null;
	
	porVisitar.push(nodoInicial); //El primer nodo a visitar es el especificado en inicio
	
	var listo=false;
	while(porVisitar.length!=0 && !listo){
		
		var actual=porVisitar[porVisitar.length-1];
		porVisitar.splice(porVisitar.length-1,1);
		
		visitados.push(actual);
		var vecinosActual=actual.vecinos;
		for(n in vecinosActual){
			if(!visitados.contiene(vecinosActual[n])){
				vecinosActual[n].padre=actual;
				if(vecinosActual[n].numero==fin.numero){
					listo=true;
					nodoFinal=vecinosActual[n];
					break;
				}
				porVisitar.push(vecinosActual[n]);
			}
		}
	}

	if(listo){
		nodoActual=nodoFinal;
		while(nodoActual!=null){
			resultado.push(nodoActual);
			nodoActual=nodoActual.padre;
		}
	}
	return resultado;
}

function generar(){
    var visitados=new Array();
    var porVisitar=new Array();
    var casillas=new Array();

    filas=eval(document.getElementById("filas").value);
    cols=eval(document.getElementById("cols").value);

    var direcciones=new Array(filas*cols); //Arreglo de direcciones posibles de cada casilla

    ARRIBA=1;
    ABAJO=2;
    IZQUIERDA=3;
    DERECHA=4;
    for(i=0;i<filas;i++){
        for(j=0;j<cols;j++){
            numero=cols*i+j;

            casillas.push(new Casilla(numero));

            dirs=new Array();
            if(i!=0){
                dirs.push(ARRIBA);
            }
            if(i!=filas-1){
                dirs.push(ABAJO);
            }
            if(j!=0){
                dirs.push(IZQUIERDA);
            }
            if(j!=cols-1){
                dirs.push(DERECHA);
            }
            dirs.shuffle();
            direcciones[numero]=dirs;
        }
    }

    rnd_fila=Math.floor(Math.random()*filas);
    rnd_col=Math.floor(Math.random()*cols);
    var primer_nodo=casillas[cols*rnd_fila+rnd_col];
    
    porVisitar.push(primer_nodo);

	var nodo_actual=null;
	var numero_actual=-1;
	var vecino_nuevo=null;
	var numero_nuevo=-1;
		
    while(porVisitar.length!=0){
		
		nporvisitar=porVisitar.length-1;
		nodo_actual=porVisitar[nporvisitar];
		
		numero_actual=nodo_actual.numero;
		
		visitados.push(nodo_actual);
		
		vecino_nuevo=nodo_actual;
		
		while(visitados.contiene(vecino_nuevo) && direcciones[numero_actual].length!=0 ){
			direccionElegida=direcciones[numero_actual][0];
			direcciones[numero_actual].splice(0,1);
			
			switch(direccionElegida){
				case ARRIBA:
					numero_nuevo=numero_actual-cols;
					vecino_nuevo=casillas[numero_nuevo];
					if(!visitados.contiene(vecino_nuevo)){
						nodo_actual.sup=true;
						vecino_nuevo.inf=true;
						nodo_actual.vecinos.push(vecino_nuevo);
						vecino_nuevo.vecinos.push(nodo_actual);
						porVisitar.push(vecino_nuevo);
					}
					break;
				case ABAJO:
					numero_nuevo=numero_actual+cols;
					vecino_nuevo=casillas[numero_nuevo];
					if(!visitados.contiene(vecino_nuevo)){
						nodo_actual.inf=true;
						vecino_nuevo.sup=true;
						nodo_actual.vecinos.push(vecino_nuevo);
						vecino_nuevo.vecinos.push(nodo_actual);
						porVisitar.push(vecino_nuevo);
					}
					break;
				case IZQUIERDA:
					numero_nuevo=numero_actual-1;
					vecino_nuevo=casillas[numero_nuevo];
					if(!visitados.contiene(vecino_nuevo)){
						nodo_actual.izq=true;
						vecino_nuevo.der=true;
						nodo_actual.vecinos.push(vecino_nuevo);
						vecino_nuevo.vecinos.push(nodo_actual);
						porVisitar.push(vecino_nuevo);
					}
					break;
				case DERECHA:
					numero_nuevo=numero_actual+1;
					vecino_nuevo=casillas[numero_nuevo];
					if(!visitados.contiene(vecino_nuevo)){
						nodo_actual.der=true;
						vecino_nuevo.izq=true;
						nodo_actual.vecinos.push(vecino_nuevo);
						vecino_nuevo.vecinos.push(nodo_actual);
						porVisitar.push(vecino_nuevo);
					}
					break;
			}
		}
		
		if(direcciones[numero_actual].length==0){
			porVisitar.remove(nodo_actual);
		}
	}
	    
    return casillas;
}
