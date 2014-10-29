#include <Button.h>

// player one
Button p1b1(2);
Button p1b2(3);
Button p1b3(4);
// player 2
Button p2b1(5);
Button p2b2(6);
Button p2b3(7);
// player 3
Button p3b1(8);
Button p3b2(9);
Button p3b3(10);
//reset
Button reset(13);

const int NUMBER_OF_BUTTONS = 9;
Button buttons[NUMBER_OF_BUTTONS] = {p3b3, p3b2, p3b1, p2b3, p2b2, p2b1, p1b3, p1b2, p1b1};

void setup() {
	Keyboard.begin();
}

void loop() {
	for(int i = 0; i < NUMBER_OF_BUTTONS; i++){
		if (buttons[i].uniquePress()) Keyboard.print(String(i+1));
	}
	if (reset.uniquePress()) Keyboard.print("r");
	delay(10);
}
