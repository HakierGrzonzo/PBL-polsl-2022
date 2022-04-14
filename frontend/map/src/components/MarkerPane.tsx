import { AppBar, Toolbar, Box, IconButton, Typography, Link } from "@mui/material";
import Section from './Section';
import CloseIcon from '@mui/icons-material/Close';
import { Measurement } from "../api";
import { getImageLink } from "../utils/fileUtils";
interface PaneProps {
  measurement: Measurement;
  closeCallback: () => void;
}

export default function MarkerPane(props : PaneProps) {
  const {measurement, closeCallback} = props;
  const image = getImageLink(measurement.files);
  return <Box sx={{flexGrow: 1}} className="sidePane">
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {measurement.title}
        </Typography>
        <IconButton onClick={closeCallback} size="large">
          <CloseIcon/>
        </IconButton>
      </Toolbar>
    </AppBar>
    { image &&
      <img src={image}/>
    }
    <Box sx={{margin: '1em'}}>
      { measurement.description &&
        <Section level="h5" title="Opis:">
          <Typography variant="body1" component="div">
            {measurement.description}
          </Typography>
        </Section>
      }
      { measurement.laeq &&
        <Section level="h5" title="Laeq:">
          <Typography variant="body1" component="div">
            {measurement.laeq}
          </Typography>
        </Section>
      }
      { measurement.weather &&
        <Section title="Dane pogodowe:" level="h5">
          <Section title="Temperatura:" level="h6">
            <Typography variant="body1" component="div">
              {Math.round(measurement.weather.temperature - 273.15)}C
            </Typography>
          </Section>
          <Section title="Wilgotność:" level="h6">
            <Typography variant="body1" component="div">
              {measurement.weather.humidity}%
            </Typography>
          </Section>
          <Section title="Ciśnienie:" level="h6">
            <Typography variant="body1" component="div">
              {measurement.weather.pressure} hPa
            </Typography>
          </Section>
        </Section>
      }
      { measurement.files.length && 
        <Section title="Pliki:" level="h5">
          <ul>
            {measurement.files.map((file) => 
              <li key={file.file_id}>
                <Link variant="body1" href={file.link + "?isDownload=true"}>
                  {file.original_name}
                </Link>
              </li>
            )}
          </ul>
        </Section>
      }
    </Box>
  </Box>
}
