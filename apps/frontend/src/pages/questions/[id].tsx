import React, { useEffect, useState } from "react";
import useQuestionById from "@/hook/useQuestionById";
import QuestionWorkspace from "@/components/questions/questionPage/QuestionWorkspace";
import { useRouter } from "next/router";
import useSessionUser from "@/hook/useSessionUser";

type QuestionPageProps = {};

const QuestionPage: React.FC<QuestionPageProps> = () => {
  const router = useRouter();
  const qid = router.query.id;
  const { sessionUser } = useSessionUser();
  const [accessToken, setAccessToken] = useState(sessionUser.accessToken);
  const [refreshToken, setRefreshToken] = useState(sessionUser.refreshToken);
  const { question } = useQuestionById(qid as string, accessToken, refreshToken);

  useEffect(() => {
    setAccessToken(sessionUser.accessToken);
    setRefreshToken(sessionUser.refreshToken);
  }, [sessionUser]);

  if (question === null) {
    router.push("/404");
  }
  
  return <div className='flex'>
    {question && <QuestionWorkspace question={question} />}
  </div>
}
export default QuestionPage;
