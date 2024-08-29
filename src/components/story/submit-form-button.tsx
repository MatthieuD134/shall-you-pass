import { useFormStatus } from 'react-dom';
import { Button, ButtonProps } from '../ui/button';

export default function SubmitFormButton(props: ButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" {...props}>
      {pending ? 'Pending...' : 'Submit'}
    </Button>
  );
}
