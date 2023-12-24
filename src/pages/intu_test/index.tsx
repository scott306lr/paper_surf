import { api } from "~/trpc/server";
import { topic_extraction, test_topic } from "~/app/_utils/data_lda";

export default function TestUrl() {
  // const data = await api.post.getData.query({ key: 'music'});

  // const data = await api.post.PostData.query({ key : ['521ede5e064c64c55349c53861819b9ac39cc2d6'], citations: true})

  // console.log(data);

  // const data_topic = await topic_extraction(data);

  // console.log('aaa', data_topic[0][0].topic);

  // var text = 'Cats are small. Dogs are big. Cats like to chase mice. Dogs like to eat bones.';

  // // Extract sentences.
  // var documents = text.match( /[^\.!\?]+[\.!\?]+/g );

  // console.log(documents)

  // // Run LDA to get terms for 2 topics (5 terms each).
  // var result = lda(documents, 5, 5);

  // console.log(result);

  const data = await test_topic("music");
  // console.log("hi",data);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          This is a intu test page
        </h1>
      </div>
    </main>
  );
}
