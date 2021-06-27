import React from "react";
import UploadModal from "../../components/UploadModal";
import ImageGrid from "../../components/ImageGrid";
import { useUser } from "../../firebase/useUser";
import NotLoggedInMessage from "../../components/NotLoggedInMessage";
import Loading from "../../components/Loading";
import firebase from "firebase/app";
import "firebase/firestore";
import { useRouter } from "next/router";
import Tags from "../../components/Tags";
import { useTags } from "../../components/TagsContext";
import TagSearch from "../../components/TagSearch";
// var user_id = null;
function siml(a, b) {
  var res = 0;
  for (var i = 0; i < b.length; i++) {
    if (a.indexOf(b[i]) != -1) {
      res++;
    }
  }
  return res;
}
const Closet = ({ userId, userCloset }) => {
  const { user } = useUser();
  const router = useRouter();
  if (user === null) {
    return <Loading />;
  }
  if (user === undefined) {
    return (
      <NotLoggedInMessage>Log in to access your closet</NotLoggedInMessage>
    );
  }
  const [tags, setTags] = React.useState([]);
  // setTags([]);
  console.log(userCloset);
  for (var j = 0; j < userCloset.length; j++)
    for (var i = 0; i < userCloset.length-1; i++) {
      if (siml(userCloset[i].tags, tags) > siml(userCloset[i + 1].tags, tags)) {
        const x = userCloset[i];
        userCloset[i] = userCloset[i + 1];
        userCloset[i + 1] = x;
      }
    }
  const displayCloset = [];
  for (var i = 0; i < userCloset.length; i ++) {
    if (siml(userCloset[i].tags, tags) >= tags.length/2) {
      displayCloset.push(userCloset[i]);
    }
  }
  firebase
    .firestore()
    .collection("users")
    .doc(user.id)
    .update({ id: user.id, name: user.name, email: user.email });
  firebase.firestore().collection("users").doc(user.id).update({id: user.id, name: user.name, email: user.email})
  // no support for sharing closets yet
  if (userId != user.id) {
    router.replace({
      pathname: "/closet/[userId]",
      query: {
        userId: user.id,
      },
    });
  }
  // logUser().then(() => {
  // console.log("here?");
  console.log(userId);
  // })
  return (
    <div>
      <div
        className={
          "bg-indigo-50 w-full h-72 flex items-center justify-between px-20"
        }
      >
        <h1 className={"text-5xl font-bold"}>My Closet</h1>
        <div>Icon of closet here</div>
      </div>

      <div className={"py-5 w-3/4 mx-auto"}>
        <Tags text={"Search by tags"} tags={tags} setTags={setTags} />
      </div>
      <UploadModal />
      <ImageGrid images={displayCloset} />
    </div>
  );
};

export async function getServerSideProps(ctx) {
  const id = ctx.params.userId;
  const doc = await firebase.firestore().collection("users").doc(id).get();
  if (!doc.exists) {
    firebase.firestore().collection("users").doc(id).set({
      //id: user.id,
      //email: user.email,
      //name: user.name,
      closet: [],
    });
  }

  const userDoc = await firebase.firestore().collection("users").doc(id).get();
  const userCloset = userDoc.data().closet ?? [];
  return {
    props: {
      userId: id,
      userCloset,
    },
  };
}

export default Closet;
