import axios from 'axios';
const fetchFabricDataFromGoogleSheet = async () => {
  try {
    const sheetId = '1SIP3Glxo5vkL0Jvx9ulj0p6xZoOh0ruzRtIqzldmb8E';
    const apiKey = 'AIzaSyAGjWAyG29vKBgiYVSXCn08cu5ym6FwiQs';
    const range = 'Fabric Rate!A1:J';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    const response = await axios.get(url);

    const fabrics = [];

    for (let i = 1; i < response.data.values.length; i++) {
      const [
        fabric_number,
        fabric_rate,
        unit,
        length,
        fabric_name,
        vender,
        width,
        recieved_qty_meter,
        recieved_qty_kg,
        date,
      ] = response.data.values[i];

      fabrics.push({
        fabric_number,
        fabric_rate,
        unit,
        length,
        fabric_name,
        vender,
        width,
        recieved_qty_meter,
        recieved_qty_kg,
        date,
      });
    }

    return fabrics;
  } catch (error) {
    console.error('Failed to fetch fabric data from google sheet :: ', error?.message);
    throw error;
  }
};

const fetchFabricNoFromFabricAverageSheet = async () => {
  try {
    const sheetId = '1SIP3Glxo5vkL0Jvx9ulj0p6xZoOh0ruzRtIqzldmb8E';
    const apiKey = 'AIzaSyAGjWAyG29vKBgiYVSXCn08cu5ym6FwiQs';
    const range = 'Fabric Average Sheet!A1:L';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    const response = await axios.get(url);

    const fabrics = [];

    for (let i = 1; i < response.data.values.length; i++) {
      const [
        style_number,
        pattern_number,
        article_type,
        style_image,
        fabric_1_no,
        fabric_1_name,
        fabric_1_image,
        fabric_2_no,
        fabric_2_name,
        fabric_2_image,
        fabric_3_no,
        fabric_3_name,
      ] = response.data.values[i];

      fabrics.push({
        style_number,
        pattern_number,
        article_type,
        style_image,
        fabric_1_no,
        fabric_1_name,
        fabric_1_image,
        fabric_2_no,
        fabric_2_name,
        fabric_2_image,
        fabric_3_no,
        fabric_3_name,
      });
    }

    return fabrics;
  } catch (error) {
    console.error(
      'Failed to fetch fabric no data from fabric average  google sheet :: ',
      error?.message
    );
    throw error;
  }
};

const fetchFabricNoFromStylwise = async () => {
  try {
    const sheetId = '1SIP3Glxo5vkL0Jvx9ulj0p6xZoOh0ruzRtIqzldmb8E';
    const apiKey = 'AIzaSyAGjWAyG29vKBgiYVSXCn08cu5ym6FwiQs';
    const range = 'Stylewise New Fabric No!A1:L';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    const response = await axios.get(url);

    const fabrics = [];

    for (let i = 1; i < response.data.values.length; i++) {
      const [
        style_number,
        fabric_1_no,
        fabric_1_name,
        fabric_2_no,
        fabric_2_name,
        fabric_3_no,
        fabric_3_name,
      ] = response.data.values[i];

      fabrics.push({
        style_number,
        fabric_1_no,
        fabric_1_name,
        fabric_2_no,
        fabric_2_name,
        fabric_3_no,
        fabric_3_name,
      });
    }

    return fabrics;
  } catch (error) {
    console.error(
      'Failed to fetch fabric no data from fabric average  google sheet :: ',
      error?.message
    );
    throw error;
  }
};
export {
  fetchFabricDataFromGoogleSheet,
  fetchFabricNoFromFabricAverageSheet,
  fetchFabricNoFromStylwise,
};
