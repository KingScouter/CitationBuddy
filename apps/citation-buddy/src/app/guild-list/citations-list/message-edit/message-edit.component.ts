import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageWithContext } from '../models/message-with-context';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-message-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './message-edit.component.html',
  styleUrl: './message-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageEditComponent implements OnInit {
  message = input.required<MessageWithContext>();
  formFields = input.required<string[]>();

  saveMessage = output<MessageWithContext>();

  protected formGroup: FormGroup | null = null;

  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      items: this.fb.array([]),
    });

    const initialData = this.message();
    for (const elem of this.formFields()) {
      const controls = this.formGroup.get('items') as FormArray;
      const initialValue = initialData.additionalData[elem] ?? '';
      controls.push(
        this.fb.group({
          [elem]: [initialValue],
        })
      );
    }
  }

  protected onSaveMessage(): void {
    const finishedData: MessageWithContext = { ...this.message() };

    const formArray = this.formGroup?.get('items') as FormArray;
    const formData = formArray.value;
    console.log(formData);

    for (const elem of this.formFields()) {
      const idx = formArray.controls.findIndex((ctrl) => !!ctrl.get(elem));
      if (idx < 0) {
        continue;
      }

      finishedData.additionalData[elem] =
        formArray.controls[idx].get(elem)?.value;
    }

    this.saveMessage.emit(finishedData);
  }
}
