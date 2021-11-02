import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";
import { notifySuccess, notifyError } from "../notification/notificationSlice";

const initialState = {
  profile: [],
  status: "idle",
};

export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (id, thunkAPI) => {
    const { getFirestore } = thunkAPI.extra;
    const firestore = getFirestore();
    const doc = await firestore.get({ collection: "profiles", doc: id });
    // console.log("data", profile.data());
    // collection.forEach((doc) => {
    //   if (doc.id === id) {
    //     profiles.push(doc.data());
    //   }
    // });
    return { ...doc.data() };
  }
);
export const fetchProfilebyid = createAsyncThunk(
  "profile/fetchProfilebyid",
  async (id, thunkAPI) => {
    const { getFirestore } = thunkAPI.extra;
    const firestore = getFirestore();
    const collection = await firestore.get("profiles");
    const profiles = [];
    collection.forEach((doc) => {
      if (doc.id === id) {
        profiles.push(doc.data());
      }
    });

    return profiles;
  }
);
export const addProfile = createAsyncThunk(
  "profile/addProfile",
  async (newProfile, thunkAPI) => {
    const { getFirestore, getFirebase } = thunkAPI.extra;
    const firestore = getFirestore();
    const firebase = getFirebase();
    const dispatch = thunkAPI.dispatch;

    // set logo
    const logoFile = newProfile.logo;
    let url = newProfile.logo;

    if (logoFile && typeof logoFile === "object") {
      const storageRef = firebase.storage().ref("/images");
      const fileRef = storageRef.child(logoFile.name);
      await fileRef.put(logoFile);
      url = await fileRef.getDownloadURL();
    }

    const currentUser = firebase.auth().currentUser.uid;

    try {
      const doc = await firestore.update(
        { collection: "profiles", doc: currentUser },
        { ...newProfile, logo: url }
      );
      dispatch(
        notifySuccess({
          text: "Profile has been updated successfully.",
          action: "Create new",
        })
      );
      return { ...newProfile, logo: url };
    } catch (ex) {
      dispatch(
        notifyError({
          text: "Profile could not be updated.Please try again later.",
          action: "Cancel",
        })
      );
    }
  }
);

export const createProfile = createAsyncThunk(
  "profile/createProfile",
  async (data, thunkAPI) => {
    const { getFirestore } = thunkAPI.extra;
    const firestore = getFirestore();
    const doc = await firestore.set(
      { collection: "profiles", doc: data.id },
      { ...data }
    );

    return data;
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: {
    [fetchProfile.pending]: (state) => {
      state.status = "loading";
    },
    [fetchProfile.fulfilled]: (state, action) => {
      state.status = "loaded";
      state.profile = action.payload;
    },
    [fetchProfile.rejected]: (state) => {
      state.status = "error";
    },
    [fetchProfilebyid.pending]: (state) => {
      state.status = "loading";
    },
    [fetchProfilebyid.fulfilled]: (state, action) => {
      state.status = "loaded";
      state.profile = action.payload;
    },
    [fetchProfilebyid.rejected]: (state) => {
      state.status = "error";
    },
    [addProfile.pending]: (state) => {
      state.status = "loading";
    },
    [addProfile.fulfilled]: (state, action) => {
      state.status = "added";
      state.profile = action.payload;
    },
    [addProfile.rejected]: (state) => {
      state.status = "error";
    },
    [createProfile.pending]: (state) => {
      state.status = "loading";
    },
    [createProfile.fulfilled]: (state, action) => {
      state.status = "added";
      state.profile = action.payload;
    },
    [createProfile.rejected]: (state) => {
      state.status = "error";
    },
    [HYDRATE]: (state, action) => {
      state.status = action.payload.profile.status;
      state.profile = action.payload.profile.profile;
    },
  },
});

export const {} = profileSlice.actions;

export default profileSlice;
