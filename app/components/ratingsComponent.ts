import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Icon } from 'ionic-angular/components/icon/icon';

@Component({
	selector: 'rating',
	directives: [Icon],
	template: `
		<ul>
			<li *ngFor="let icon of icons(); let i = index" (click)="onUpdate(i+1)">
				<ion-icon [name]="icon"></ion-icon>
			</li>
		</ul>
	`,
	styles: [`
		ul {
			display: block;
			list-style: none;
			padding: 0;
			margin: 0;
		}
		li {
			display: inline-block;
			color: #c2b560;
			
		}
		li + li {
			margin-left: .1em;
		}
	`],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingComponentUpdateable {

	@Input() public score: number = 1;
	@Input() public max: number = 5;

	@Input() public iconEmpty: string = 'star-outline';
	@Input() public iconHalf: string = 'star-half';
	@Input() public iconFull: string = 'star';

	@Output() public update: EventEmitter<any> = new EventEmitter();

	onUpdate(score: number): void {
		this.score = score;
		this.update.emit(score);
	}

	public icons(): string[] {
		let step = 0.5;
		console.log(this.score);
		let score = Math.ceil(this.score / step) * step;
		console.log('the score is now: ' + score);
		let icons = [];
		for (let i = 1; i <= this.max; i++) {
			if (i <= score) {
				icons.push(this.iconFull);
			} else if (i - step <= score) {
				icons.push(this.iconHalf);
			} else {
				icons.push(this.iconEmpty);
			}
		}

		console.log(icons);
		return icons;
	}
}