import { AppBar, Toolbar, Box, IconButton, Typography, Button } from "@mui/material";
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
  const audioFiles = measurement.files.filter((file) => file.mime.startsWith("audio"));
  return <Box sx={{
    flexGrow: 1,
    height: {
      xs: '50vh',
      sm: '100vh',
    },
    overflow: 'auto',
  }} className="sidePane">
    <AppBar position="sticky">
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
      { audioFiles.length > 0 && 
        <Section title="Nagrania:" level="h5">
          <>
            {audioFiles.map((file) => 
              <Section title={file.original_name} level="body1" key={file.file_id}>
                <audio controls> 
                  <source src={file.link} type={file.optimized_mime || file.mime}/>
                </audio>
              </Section>
            )}
          </>
        </Section>
      }
      { measurement.files.length > 0 && 
        <Section title="Pliki:" level="h5">
          <ul>
            {measurement.files.map((file) => 
              <li key={file.file_id}>
                <Section title={file.mime.split('/')[0]} level="body1"> 
                  {/* TODO: group by type */}
                  <Typography variant="body2"> 
                    {file.original_name} 
                    <Button href={file.link + "?isDownload=true&optimized=false"}>
                      Pobierz
                    </Button>
                  </Typography>
                </Section>
              </li>
            )}
          </ul>
        </Section>
      }
    </Box>
  </Box>
}