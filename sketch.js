var canvas;
var song;
var img;
var fft;
var smoothing = 0.8;
var spectrumfreqs = 512;
var rotateAng = 0;
var Amplitude;

var mWidth = 600;
var mHeight = 800;

var inputElement;
var instructionshidden = false;

var button;

function onClickHideShowInstructions()
{
	var instructionsEl = select("#instructions");
	if(instructionsEl)
	{
		if(instructionshidden)
		{
			instructionsEl.show();
		}
		else
		{
			instructionsEl.hide();
		}
		instructionshidden = !instructionshidden;
	}
}

function toggleSong()
{
	if(song)
	{
		if(song.isPlaying())
		{
			song.pause();
			button.html("RESUME");
		}
		else
		{
			song.play();
			button.html("PAUSE");
		}
	}
}

function centerCanvas()
{
	canvas.position((windowWidth - mWidth)/2, (windowHeight - mHeight)/2);
}

function windowResized() // now with 100% more responsive design!
{
	centerCanvas();
}

function preload()
{
	document.body.style.background = "#202020";
}

function setup()
{
	canvas = createCanvas(mWidth,mHeight);
	centerCanvas();
	angleMode(DEGREES);
	fft = new p5.FFT(smoothing, spectrumfreqs);
	Amplitude = new p5.Amplitude();
		
	inputElement = createFileInput(gotFile,false);
}

function gotFile(file)
{
	if (file.type === 'image')
	{
		img = loadImage(file.data, function()
		{
			mWidth = img.width;
			mHeight = img.height;
			resizeCanvas(mWidth, mHeight);
			centerCanvas();
		});
	}
	else if (file.type === 'audio')
	{
		song = loadSound(file.data, function()
		{
			button = createButton('PLAY!').mousePressed(toggleSong);
		});
	}
}

function draw()
{
	background('rgba(40,40,40,0.5)');
	
	if(img)
	{
		image(img,0,0);
	}
			
	var spectrum = fft.analyze();
	
	rotateAng = (rotateAng + 0.2) % 360;
	
	var SpectrumFreqsToDraw = Math.floor(spectrum.length * 0.2);
	var SpectrumFreqsToDispose = spectrum.length - SpectrumFreqsToDraw;
	var IniFreq = Math.floor(SpectrumFreqsToDispose * 0.35);
	
	var volume = Amplitude.getLevel();
	
	push();
	translate(canvas.width/2, canvas.height/2);
	noFill();
	strokeWeight(2);
	stroke(255,255,255,255);
	rotate(rotateAng);
	beginShape();
	for(var i=0; i < SpectrumFreqsToDraw; i++)
	{
		var CurrentFreq = i + IniFreq;
		
		var angle = map(i, 0, SpectrumFreqsToDraw, 0, 360);
		var amp = spectrum[CurrentFreq];
		
		var r = map(amp, 0, spectrumfreqs, canvas.width * 0.1, canvas.width * 0.4);
		var x = r * cos(angle);
		var y = r * sin(angle);
			
		push();
		strokeWeight(2);
		stroke(255,255,255);
		point(x+(x*(volume*0.2)*2),y+(y*(volume*0.2)*2));
		pop();
					
		vertex(x+(x*(volume*0.2)*0.8),y+(y*(volume*0.2)*0.8));
	}
	endShape(CLOSE);
	pop();
}