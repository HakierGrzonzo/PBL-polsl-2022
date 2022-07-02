import { Tooltip, Typography } from "@mui/material";
import { Box } from "@mui/system";

interface IScoreBarProps {
  score: number;
  deviation: number;
  min: number;
  max: number;
}

export function ScoreBar(props: IScoreBarProps): JSX.Element {
  const { min, max, deviation, score} = props;
  return (
    <Box sx={{
      flex: 1,
      display: 'grid',
      gridTemplateColumns: `${Math.max(0, score - deviation - min)}fr ${2 * deviation}fr ${Math.max(max - score - deviation, 0)}fr`,
      gridTemplateRows: '1em 2em',
    }}
    >
      <Box sx={{
        backgroundColor: 'red',
      }}
      />
      <Tooltip title="Pomarańczowa sekcja reprezentuje 66% wszystkich odpowiedzi, im jest ona większa, tym bardziej niepewny jest wynik">
        <Box sx={{
          backgroundColor: 'orange',
        }}
        />
      </Tooltip>
      <Box sx={{
        backgroundColor: 'lime',
      }}
      />
      <Typography variant="body1">
        {min}
      </Typography>
      <Typography 
        sx={{
          justifySelf: 'center',
          alignSelf: 'center',
        }} 
        variant="body2"
      >
        {score.toFixed(2)}
      </Typography>
      <Typography 
        sx={{
          justifySelf: 'end',
          alignSelf: 'center',
        }} 
        variant="body2"
      >
        {max}
      </Typography>
    </Box>
  )
}
