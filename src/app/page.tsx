"use client";

import { useState } from "react";
import FirstStep from "./components/FirstStep/FirstStep";
import SecondStep from "./components/SecondStep/SecondStep";
import { User, UserResultShape, createUser, isEmailValid } from "./utils/sdk";

export type validFieldNames = "name" | "age" | "email" | "newsletter";

interface UserShape extends Omit<User, "age"> {
  age: number | "";
}

const isDisabled = (step: 0 | 1, data: any): boolean => {
  let result: boolean = true;

  switch (step) {
    case 0: {
      result = data.name === "" || data.age === "";
      break;
    }
    case 1: {
      result = !isEmailValid(data.email);

      break;
    }
  }

  return result;
};

const initialState: UserShape = {
  name: "",
  age: "",
  email: "",
  newsletter: "daily",
};

export default function Home() {
  const [state, setState] = useState<UserShape>(initialState);

  const [currentStep, setCurrentStep] = useState<0 | 1>(0);
  const [result, setResult] = useState<UserResultShape | null>(null);
  const [loading, setLoading] = useState(false);

  const updateState = (fieldName: validFieldNames, value: any) => {
    let targetValue = value;

    if (fieldName === "age") {
      if (isNaN(value) || +value === 0) {
        return;
      }

      targetValue = Math.round(+value);
    }

    setState((prevState) => ({ ...prevState, [fieldName]: targetValue }));
  };
  console.log({ state });
  const run = async () => {
    if (state.age) {
      try {
        setLoading(true);
        const result: UserResultShape = await createUser({
          ...state,
          age: state.age,
        });

        setResult(result);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }
  };

  const onSubmit = (e: any) => {
    e.preventDefault();

    if (currentStep) {
      run();
    } else {
      setCurrentStep(1);
    }
  };

  const goBack = () => {
    setCurrentStep(0);
  };
  const onReset = () => {
    setResult(null);
    setState(initialState);
    setCurrentStep(0);
  };

  return (
    <main className="bg-slate-400		h-screen flex flex-col justify-center items-center gap-6 ">
      {result ? (
        <div className="flex flex-col justify-center items-start gap-6 w-6/12  border-solid border-2 border-slate-500 p-8 rounded">
          Result:
          <p>Name: {result.user.name}</p>
          <p>Age: {result.user.age}</p>
          <p>Email: {result.user.email}</p>
          <p>Newsletter: {result.user.newsletter}</p>
          <p>Token: {result.token}</p>
          <button
            className="bg-white cursor-pointer	self-center text-black p-2"
            onClick={onReset}
          >
            Reset
          </button>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="flex flex-col justify-center items-center gap-6 w-6/12  border-solid border-2 border-slate-500 p-8 rounded"
        >
          {loading ? (
            "Loading..."
          ) : (
            <>
              <div className="border-solid border-2 border-slate-500 p-8 rounded self-center w-4 h-4 flex items-center justify-center text-black font-bold	text-xl">
                {currentStep + 1}/2
              </div>
              <div className="flex flex-col justify-start gap-3 w-full ">
                {currentStep ? (
                  <SecondStep
                    email={state.email}
                    newsletter={state.newsletter}
                    onChange={updateState}
                  />
                ) : (
                  <FirstStep
                    name={state.name}
                    age={state.age}
                    onChange={updateState}
                  />
                )}
              </div>
              <div className="flex w-full  flex-row-reverse justify-between">
                <button
                  className="bg-white self-start text-black p-2  cursor-pointer	 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={onSubmit}
                  disabled={isDisabled(currentStep, state)}
                >
                  {currentStep ? "Submit" : "Next"}
                </button>
                {!!currentStep && (
                  <button
                    className="bg-white cursor-pointer	 text-black p-2"
                    onClick={goBack}
                  >
                    Back
                  </button>
                )}
              </div>
            </>
          )}
        </form>
      )}
    </main>
  );
}
