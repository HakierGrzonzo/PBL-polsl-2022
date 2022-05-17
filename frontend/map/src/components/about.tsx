import { Box, Typography } from "@mui/material";
import Section from "./Section";

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default function About() {
  return (
    <Box sx={modalStyle}>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        PBL-polsl-2022
      </Typography>
      <Typography id="modal-modal-description" variant="body2" sx={{ mt: 2 }}>
        Powered by GrzesHosting 2022
      </Typography>
      <Section level="h6" title="O Aplikacji">
        <Typography variant="body1">
          <ul> 
            <li>
              Kod źródłowy dostępny na licencji GPL 
              na <a href="https://github.com/HakierGrzonzo/PBL-polsl-2022">
                Github&lsquo;ie
              </a>
            </li>
            <li>
              Dane pogodowe pobierane z API <a href="https://openweathermap.org/">
                OpenWhetherMap
              </a>
            </li>
          </ul>
        </Typography>
      </Section>
      <Section level="h6" title="Programiści">
        <Typography variant="body1">
          <ul> 
            <li>
              <a href="https://grzegorzkoperwas.site/">Grzegorz Koperwas</a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/kamil-kowlaczyk-33b675175/">Kamil Kowalczyk</a>
            </li>
          </ul>
        </Typography>
      </Section>
      <Section level="h6" title="Zespół naukowy">
        <Typography variant="body1">
          <ul> 
            <li>
              Agata Fąfara
            </li>
            <li>
              Agnieszka Majda
            </li>
            <li>
              Sebastian Giełżecki
            </li>
            <li>
              Wiktoria Paulus
            </li>
          </ul>
        </Typography>
      </Section>
      <Section level="h6" title="Kierownictwo wojskowe">
        <Typography variant="body1">
          <ul> 
            <li>
              dr. Marcin Sobota
            </li>
            <li>
              dr. Waldemar Paszkowski
            </li>
            <li>
              dr. inż. Artur Kuboszek
            </li>
          </ul>
        </Typography>
      </Section>
    </Box>
  );
}
