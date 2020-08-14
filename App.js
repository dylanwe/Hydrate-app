import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
	StyleSheet,
	Text,
	View,
	SafeAreaView,
	Alert,
	TouchableOpacity,
	Keyboard,
	TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTint, faCog, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function App() {
	// set vars
	const [waterDrank, setWaterDrank] = useState(0);
	const [menuOpen, setmenuOpen] = useState(false);
	const [dailyGoal, setDailyGoal] = useState(2500);
	const [bottle, setBottle] = useState(250);
	const [dailyGoalSettings, onChangeDailyGoalSettings] = useState(
		`${dailyGoal}`
	);
	const [bottleSettings, onChangeBottleSettings] = useState(`${bottle}`);

	// Async storage
	const storeWater = async (value) => {
		try {
			await AsyncStorage.setItem('storedWater', value);
		} catch (e) {
			// saving error
		}
	};
	const getStoredWater = async () => {
		try {
			const value = await AsyncStorage.getItem('storedWater');
			if (value !== null && !isNaN(value)) {
				setWaterDrank(parseInt(value));
			}
		} catch (e) {
			// error reading value
		}
	};
	// init stored water data
	getStoredWater();

	// store settings
	const storeSettings = async (daily, bottle) => {
		try {
			await AsyncStorage.setItem('dailyGoalSetting', daily);
			await AsyncStorage.setItem('bottleSetting', bottle);
		} catch (e) {
			// saving error
		}
	};
	const getStoredSettings = async () => {
		try {
			const valueDailyGoalSetting = await AsyncStorage.getItem(
				'dailyGoalSetting'
			);
			const valueBottleSetting = await AsyncStorage.getItem(
				'bottleSetting'
			);
			if (
				valueDailyGoalSetting !== null &&
				!isNaN(valueDailyGoalSetting) &&
				valueBottleSetting !== null &&
				!isNaN(valueBottleSetting)
			) {
				setDailyGoal(valueDailyGoalSetting);
				setBottle(valueBottleSetting);
			}
		} catch (e) {
			// error reading value
		}
	};
	// init stored settings data
	getStoredSettings();

	const addWater = (amount) => {
		amount = parseInt(amount);
		if (!isNaN(amount)) {
			if (waterDrank + amount >= dailyGoal) {
				setWaterDrank(dailyGoal);
				storeWater(`${dailyGoal}`);
			} else if (waterDrank + amount <= 0) {
				setWaterDrank(0);
				storeWater(`0`);
			} else {
				setWaterDrank(waterDrank + amount);
				storeWater(`${waterDrank + amount}`);
			}
		} else {
			setWaterDrank(waterDrank + 0);
			storeWater(`${waterDrank + 0}`);
		}
	};

	const storeDate = async () => {
		try {
			// store current date
			await AsyncStorage.setItem('storedDate', `${new Date()}`);
		} catch (e) {
			// saving error
		}
	};

	// compare dates to see if a day is passed and it should reset waterDrank
	const compareDate = async () => {
		try {
			const storedDate = await AsyncStorage.getItem('storedDate');
			// if date does exist reset program if it doesn't store a date
			if (storedDate !== null) {
				const currentDate = new Date();
				const covertedStoredDate = new Date(storedDate);
				const firstDateIsPastDayComparedToSecond = (
					firstDate,
					secondDate
				) =>
					firstDate.setHours(0, 0, 0, 0) -
						secondDate.setHours(0, 0, 0, 0) <
					0;

				// is the first date in the past then run function
				if (
					firstDateIsPastDayComparedToSecond(
						covertedStoredDate,
						currentDate
					)
				) {
					addWater(-dailyGoal);
					storeDate();
					console.log(`Current date: ${currentDate}`);
					console.log(`Stored date: ${storedDate}`);
				} else {
					console.log('same day open');
				}
			} else {
				storeDate();
			}
		} catch (e) {
			// error reading value
		}
	};
	// init compareDate
	useEffect(() => {
		compareDate();

		setInterval(function() {
			const currentHour = `${new Date().getHours()}`;
			const currentMinute = `${new Date().getMinutes()}`;
			// check every minute and reset when hour is 0 and minute is 0 if so reset
			if (currentHour === '0' && currentMinute === '0') {
				compareDate();
			}
		}, 60 * 1000); // 60 * 1000 milsec
	}, []);

	

	const settingsToggle = () => {
		setmenuOpen(!menuOpen);
		Keyboard.dismiss();
	};

	const settingsSave = () => {
		storeSettings(dailyGoalSettings, bottleSettings);
		getStoredSettings();
		settingsToggle();
	};

	return (
		<View style={styles.body}>
			{/* settings */}
			<View
				style={[
					styles.settingsMenu,
					{
						display: `${menuOpen ? 'block' : 'none'}`,
					},
				]}
			>
				<SafeAreaView onPress={() => Keyboard.dismiss()}>
					<TouchableOpacity
						style={styles.settingsButton}
						onPress={() => settingsToggle()}
					>
						<FontAwesomeIcon
							icon={faTimes}
							color={'black'}
							size={24}
						/>
					</TouchableOpacity>
					<View style={{ paddingHorizontal: 20 }}>
						<Text style={styles.settingsText}>
							Daily water goal in ml
						</Text>
						<TextInput
							style={styles.settingsInput}
							onChangeText={(text) =>
								onChangeDailyGoalSettings(text)
							}
							placeholder={dailyGoalSettings}
							keyboardType={'number-pad'}
						/>
						<Text style={styles.settingsText}>
							Amount of a bottle in ml
						</Text>
						<TextInput
							style={styles.settingsInput}
							onChangeText={(text) =>
								onChangeBottleSettings(text)
							}
							placeholder={bottleSettings}
							keyboardType={'number-pad'}
						/>
						<TouchableOpacity
							style={styles.settingsSave}
							onPress={() => settingsSave()}
						>
							<Text
								style={{
									alignSelf: 'center',
									color: '#fff',
									fontWeight: 'bold',
								}}
							>
								Save
							</Text>
						</TouchableOpacity>
					</View>
				</SafeAreaView>
			</View>
			{/* main content */}
			<SafeAreaView style={styles.container}>
				<TouchableOpacity
					style={styles.settingsButton}
					onPress={() => settingsToggle()}
				>
					<FontAwesomeIcon icon={faCog} color={'white'} size={24} />
				</TouchableOpacity>

				<View style={styles.wrapper}>
					<Text style={styles.textWaterLeft}>
						{dailyGoal - waterDrank}
						<Text style={styles.textWaterLeftMeasurement}>ml</Text>
					</Text>
					<Text style={styles.titleText}>
						Left to hit your daily goal!
					</Text>
				</View>
				<View style={styles.wrapper}>
					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={[
								styles.button,
								{
									backgroundColor: `${
										waterDrank >= dailyGoal
											? '#4DAC5F'
											: '#0064ED'
									}`,
								},
							]}
							onPress={() => addWater(-bottle)}
						>
							<Text style={styles.buttonText}>
								-
								<FontAwesomeIcon
									icon={faTint}
									color={'white'}
								/>
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.button,
								{
									backgroundColor: `${
										waterDrank >= dailyGoal
											? '#4DAC5F'
											: '#0064ED'
									}`,
								},
							]}
							onPress={() =>
								Alert.prompt(
									'How much ml of water did you drink?',
									'',
									[
										{
											text: 'OK',
											onPress: (amount) =>
												addWater(amount),
										},
									]
								)
							}
						>
							<Text style={styles.buttonText}>+</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.button,
								{
									backgroundColor: `${
										waterDrank >= dailyGoal
											? '#4DAC5F'
											: '#0064ED'
									}`,
								},
							]}
							onPress={() => addWater(bottle)}
						>
							<Text style={styles.buttonText}>
								+
								<FontAwesomeIcon
									icon={faTint}
									color={'white'}
								/>
							</Text>
						</TouchableOpacity>
					</View>
				</View>

				<StatusBar style="auto" barStyle="dark-content" />
			</SafeAreaView>
			<View
				style={[
					styles.indicator,
					{
						height: `${Math.floor(
							(100 / dailyGoal) * waterDrank
						)}%`,
						backgroundColor: `${
							waterDrank >= dailyGoal ? '#51E66E' : '#1782FF'
						}`,
					},
				]}
			></View>
		</View>
	);
}

const styles = StyleSheet.create({
	body: {
		flex: 1,
		backgroundColor: '#152940',
	},
	container: {
		flex: 1,
	},
	wrapper: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	indicator: {
		position: 'absolute',
		width: '100%',
		bottom: 0,
		zIndex: -1,
	},
	textWaterLeft: {
		fontSize: 77,
		color: '#fff',
		fontWeight: 'bold',
	},
	textWaterLeftMeasurement: {
		fontSize: 18,
		fontWeight: 'normal',
		color: '#fff',
		marginTop: 200,
		marginBottom: 10,
	},
	titleText: {
		color: '#fff',
		fontSize: 18,
		marginBottom: 30,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		flexWrap: 'wrap',
	},
	button: {
		flex: 1,
		margin: 10,
		backgroundColor: '#0064ED',
		borderRadius: 10,
	},
	buttonText: {
		textAlign: 'center',
		color: '#fff',
		margin: 20,
		fontSize: 18,
	},
	settingsButton: {
		height: 40,
		width: 40,
		alignSelf: 'flex-end',
		zIndex: 2,
		justifyContent: 'flex-end',
	},
	settingsMenu: {
		position: 'absolute',
		height: '100%',
		width: '100%',
		backgroundColor: '#fff',
		zIndex: 200,
	},
	settingsText: {
		marginTop: 30,
	},
	settingsInput: {
		height: 40,
		borderColor: 'gray',
		borderWidth: 1,
		paddingHorizontal: 20,
		marginTop: 10,
	},
	settingsSave: {
		marginTop: 30,
		textAlign: 'center',
		width: '100%',
		padding: 15,
		borderRadius: 10,
		backgroundColor: '#0064ED',
	},
});
