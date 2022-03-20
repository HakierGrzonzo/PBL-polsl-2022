import * as React from "react";
import { Button, TextField, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { AuthService } from "../api";

export default function Login() {
  const { enqueueSnackbar } = useSnackbar();

  function handleSubmit(e: any) {
    e.preventDefault();
    if (!e.target.elements.username.value || !e.target.elements.password.value) {
      enqueueSnackbar("Please fill in all fields", { variant: "error" });
      return;
    }
    let formData = {
      username: e.target.elements.username.value,
      password: e.target.elements.password.value,
    };
    AuthService.authCookieLoginApiAuthLoginPost(formData).then(_ => {
      enqueueSnackbar("Login successfully!", {
        variant: "success",
      });
      // go to /editor/mobile
      //window.location.href = '/editor/mobile'; with refresh 
      window.history.pushState({}, "", "/editor/mobile");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }).catch(_ => {
      enqueueSnackbar("We have problem with login", { variant: "error" });
      //console.log(err);
    });
  }

  return (
    <form className='flex-col simple-form text-center min-h-screen justify-evenly flex m-auto'
      onSubmit={handleSubmit}>
      <Typography variant='h4' className='mb-4'>
        Login
      </Typography>
      <TextField
        id="username"
        label="username"
        margin="normal"
        className='w-full'
      />
      <TextField
        id="password"
        label="password"
        margin="normal"
        type='password'
        className='w-full'
      />
      <Button type="submit" variant="contained" id="submit" >submit</Button>
      <br />
    </form>
  );
} 
