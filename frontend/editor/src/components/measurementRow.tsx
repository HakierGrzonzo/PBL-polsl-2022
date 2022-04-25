import { Typography } from "@mui/material";

interface RowProps {
  name: string;
  children: any;
}

export function MeasuermentRow(props: RowProps) {
  const {name, children} = props;
  return <>
    <div className='measurement-row'>
      <Typography variant="h6">{name}:</Typography>
      <div className='w-24' />
      <Typography variant="body1">{children}</Typography>
    </div>
  </>
}
