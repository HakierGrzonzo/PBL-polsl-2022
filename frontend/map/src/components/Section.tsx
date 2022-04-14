import { Box, Typography } from "@mui/material";
interface SectionProps {
  title: string;
  level: "h1" | 
    "h2" | 
    "h3" | 
    "h4" | 
    "h5" | 
    "h6" | 
    "subtitle1" | 
    "subtitle2" | 
    "body1" | 
    "body2" | 
    "caption" | 
    "button" | 
    "overline" | 
    "inherit" | undefined;
  children: JSX.Element[] | JSX.Element;
}

export default function Section(props: SectionProps) {
  const {title, level, children} = props;
  return <> 
    <Typography variant={level} component="div">
      {title}
    </Typography>
    <Box sx={{ margin: ".5em"}}> 
      {children}
    </Box>
  </>
}
