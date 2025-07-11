import { render } from '@testing-library/react';
import { Card, CardBody, CardFooter, CardHeader } from './Card';

describe('Card', () => {
  it('renders children', () => {
    const { getByText } = render(
      <Card>
        <CardHeader>Заголовок</CardHeader>
        <CardBody>Контент</CardBody>
        <CardFooter>Футер</CardFooter>
      </Card>,
    );
    expect(getByText('Заголовок')).toBeInTheDocument();
    expect(getByText('Контент')).toBeInTheDocument();
    expect(getByText('Футер')).toBeInTheDocument();
  });
});
